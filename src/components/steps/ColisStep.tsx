import React, { useEffect, useState, useRef, useContext, useCallback } from 'react';
import { useFormContext, useFieldArray, useWatch } from 'react-hook-form';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { AudioRecorderWithVisualizer } from '../audio-recorder-with-visualizer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '../button';
import { CalendarIcon, InfoIcon, AlertCircle, PackageSearch, Package as PackageIcon } from 'lucide-react';
import { Modal, ModalBody, ModalContent, ModalTrigger } from '../animated-modal';
import { ColisListing } from '@/components/ColisListing';
import { Textarea } from '../textarea';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { WeightInput } from '../WeightInput';
import { StepperFormValues, Package } from '@/types/stepper';
import FileUpload from '../file-upload';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { PackagesOptions } from './PackagesOptions';
import { useToast } from '@/hooks/use-toast';
import { StepperContext } from '../stepper';
import { VEHICLE_WEIGHT_LIMITS, VEHICLE_DIMENSION_LIMITS, VEHICLE_VOLUME_LIMITS, calculateTotalPackagesVolume, cm3ToLitres } from '@/utils/dimensionValidation';
import { thumbnailSectionRef } from './stepperRefs';

const TERRESTRIAL_LIMITS: Record<number, number> = {
  1: VEHICLE_WEIGHT_LIMITS[1],   // Car:   550 kg
  2: VEHICLE_WEIGHT_LIMITS[2],   // Van:   1 500 kg
  3: VEHICLE_WEIGHT_LIMITS[3],   // Truck: 4 500 kg
  4: VEHICLE_WEIGHT_LIMITS[4],   // Bus:   30 kg
  5: VEHICLE_WEIGHT_LIMITS[5],   // Train: 40 kg
};

export function ColisStep() {
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const stepperRef = useRef<HTMLDivElement>(null);
  const packageContainerRef = useRef<HTMLDivElement>(null);
  const { stepperLanguage } = useContext(StepperContext);
  
  const {
    formState: { errors, isSubmitting },
    register,
    control,
    setValue,
    watch,
    getValues,
    trigger,
    setError,
    clearErrors,
  } = useFormContext<StepperFormValues>();
  const fieldErrors = errors as any;
  const { shipmentTypes, sizes } = useSelector((state: RootState) => state.website);

  // State for shipment type, vehicle, package modal, etc.
  const [selectedShipmentType, setSelectedShipmentType] = useState<number>(() => {
    const formValues = getValues();
    return formValues?.shipment_type?.id || 2;
  });
  const [currentFieldIndex, setCurrentFieldIndex] = useState<number | null>(null);
  const [modalError, setModalError] = useState<boolean>(false);
  const [weightLimitExceeded, setWeightLimitExceeded] = useState<boolean>(false);
  const [volumeLimitExceeded, setVolumeLimitExceeded] = useState<boolean>(false);
  const [thumbnailSource, setThumbnailSource] = useState<'upload' | 'package'>('package');
  const [selectedPackageImageIndex, setSelectedPackageImageIndex] = useState<number | null>(null);
  const [selectedPackageIndex, setSelectedPackageIndex] = useState<number | null>(null);
  const packageImagePreviewUrlsRef = useRef<Map<string, string>>(new Map());
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'packages',
    rules: {
      required: t("expedier.departureStep.validation.packageRequired"),
      minLength: {
        value: 1,
        message: t("expedier.departureStep.validation.packageRequired")
      }
    }
  });
  const [selectedSize, setSelectedSize] = useState<any>(null);
  // Persist vehicle type selection
  const [selectedVehicleType, setSelectedVehicleType] = useState(() => {
    const formValues = getValues();
    return formValues?.subShipmentType?.id || '';
  });
  const watchedFields = useWatch({
    control,
    name: ['title', 'shipment_type', 'startDate', 'endDate', 'publishDate', 'propositionPrice', 'thumbnailId', 'packages', 'valueSum']
  });
  const [title, shipment_type, startDate, endDate, publishDate, propositionPrice, thumbnailId, packages, valueSum] = watchedFields;
  const hasExactDimensions = currentFieldIndex !== null ? watch(`packages.${currentFieldIndex}.dimensions`) !== null : false;

  // Sync state with thumbnailId from form (for restoration) - CONSOLIDATED with single effect below
  // Removed to prevent duplicate effect conflict that was overriding user button clicks

  // Calculate total value and weight
  const calculateTotalValue = (packages: Package[]) => {
    return packages.reduce((total, pkg) => {
      const quantity = parseInt(String(pkg.quantity)) || 1;
      const value = parseFloat(String(pkg.value)) || 0;
      return total + (quantity * value);
    }, 0);
  };
  const calculateTotalWeight = useCallback((packages: Package[]) => {
    return packages.reduce((total, pkg) => {
      const packageWeight = pkg.weight || 0;
      const quantity = pkg.quantity || 1;
      return total + (packageWeight * quantity);
    }, 0);
  }, []);

  const getFilePreviewKey = useCallback((file: File) => {
    return `${file.name}:${file.size}:${file.lastModified}`;
  }, []);

  const resolvePackageImageUrl = useCallback((image: unknown) => {
    if (image instanceof File) {
      const fileKey = getFilePreviewKey(image);
      const existingUrl = packageImagePreviewUrlsRef.current.get(fileKey);
      if (existingUrl) {
        return existingUrl;
      }

      const objectUrl = URL.createObjectURL(image);
      packageImagePreviewUrlsRef.current.set(fileKey, objectUrl);
      return objectUrl;
    }

    if (typeof image === 'object' && image !== null) {
      if ('path' in image && typeof (image as { path?: unknown }).path === 'string') {
        return (image as { path: string }).path;
      }

      if ('id' in image && (image as { id?: unknown }).id) {
        return `/api/v1/uploads/${String((image as { id: unknown }).id)}`;
      }

      if ('objectURL' in image && typeof (image as { objectURL?: unknown }).objectURL === 'string') {
        return (image as { objectURL: string }).objectURL;
      }
    }

    return '';
  }, [getFilePreviewKey]);

  useEffect(() => {
    const previewUrls = packageImagePreviewUrlsRef.current;

    return () => {
      previewUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      previewUrls.clear();
    };
  }, []);

  // Calculate total volume (in cm³)
  const calculateTotalVolumeFromPkgs = useCallback((packages: Package[]) => {
    return calculateTotalPackagesVolume(packages);
  }, []);

  // Watch for external changes to subShipmentType (e.g. from edit mode reset)
  const subShipmentType = watch('subShipmentType');
  useEffect(() => {
    if (subShipmentType?.id) {
      setSelectedVehicleType(subShipmentType.id);
    }
  }, [subShipmentType]);

  // Modal handlers
  const handleCancel = () => {
    document.body.style.overflow = 'auto';
    if (currentFieldIndex !== null) {
      remove(currentFieldIndex);
    }
    setModalError(false);
    setCurrentFieldIndex(null);
  };

  const handleSave = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (currentFieldIndex === null) return;
    const isValid = await trigger([
      `packages.${currentFieldIndex}.title`,
      `packages.${currentFieldIndex}.content`,
      `packages.${currentFieldIndex}.dimensions.length`,
      `packages.${currentFieldIndex}.dimensions.width`,
      `packages.${currentFieldIndex}.dimensions.height`,
      `packages.${currentFieldIndex}.weight`,
      `packages.${currentFieldIndex}.quantity`,
      `packages.${currentFieldIndex}.value`,
      `packages.${currentFieldIndex}.images`,
    ]);
    if (!isValid) {
      setModalError(true);
      return;
    }
    // Check weight limit for air shipment type
    const currentShipmentType = getValues('shipment_type');
    const currentPackages = getValues('packages');
    
    if (currentShipmentType?.id === 1) {
      const weightWithoutCurrent = currentPackages
        .filter((_: any, index: number) => index !== currentFieldIndex)
        .reduce((total: number, pkg: Package) => total + ((pkg.weight || 0) * (pkg.quantity || 1)), 0);
      const currentPackageWeight = ((currentPackages[currentFieldIndex]?.weight || 0) * (currentPackages[currentFieldIndex]?.quantity || 1));
      if (weightWithoutCurrent + currentPackageWeight > 32) {
        setValue(`packages.${currentFieldIndex}.weightError`, t("expedier.departureStep.packages.modal.weight.error"));
        setModalError(true);
        return;
      } else {
        setValue(`packages.${currentFieldIndex}.weightError`, undefined);
      }
    } else if (currentShipmentType?.id === 2) {
      const vehicleId = Number(selectedVehicleType);
      const limitForRemove = TERRESTRIAL_LIMITS[Number(vehicleId)] || 0;
      const weightWithoutCurrent = currentPackages
        .filter((_: any, index: number) => index !== currentFieldIndex)
        .reduce((total: number, pkg: Package) => total + ((pkg.weight || 0) * (pkg.quantity || 1)), 0);
      const currentPackageWeight = ((currentPackages[currentFieldIndex]?.weight || 0) * (currentPackages[currentFieldIndex]?.quantity || 1));
      if (limitForRemove > 0 && weightWithoutCurrent + currentPackageWeight > limitForRemove) {
        setValue(`packages.${currentFieldIndex}.weightError`, t('expedier.departureStep.packages.weightLimitExceeded.terrestrialError', { limit: limitForRemove }));
        setModalError(true);
        return;
      } else {
        setValue(`packages.${currentFieldIndex}.weightError`, undefined);
      }
    } else {
      if (fields.length >= 4) {
        return;
      }
    }

    // Check volume limit for all shipment types
    const vehicleIdForVol = currentShipmentType?.id === 1 ? 6 : Number(selectedVehicleType);
    const maxVolume = VEHICLE_VOLUME_LIMITS[vehicleIdForVol] || 0;
    if (maxVolume > 0) {
      const totalVolume = calculateTotalVolumeFromPkgs(currentPackages);
      if (totalVolume > maxVolume) {
        setModalError(true);
        return;
      }
    }

    setModalError(false);
    setCurrentFieldIndex(null);
    document.body.style.overflow = 'auto';
    setModalError(false);
    setValue('packages', [...currentPackages]);
  };

  // Size select
  const handleSizeSelect = (sizeId: string) => {
    if (currentFieldIndex !== null) {
      const selected = sizes.find((size: any) => size.id === parseInt(sizeId));
      if (selected) {
        setSelectedSize(selected);
        setValue(`packages.${currentFieldIndex}.sizeId`, selected.id);
        setValue(`packages.${currentFieldIndex}.dimensions`, {
          length: selected.maxLength,
          width: selected.maxWidth,
          height: selected.maxHeight
        });
      }
    }
  };

  // Delete handler
  const handleDelete = (index: number) => {
    remove(index);
    setCurrentFieldIndex(null);
  };

  // Effects for value sum
  useEffect(() => {
    const currentPackages = Array.isArray(packages) ? packages : [];
    const totalValue = currentPackages.reduce((total, pkg) => {
      const quantity = parseInt(String(pkg.quantity)) || 1;
      const value = parseFloat(String(pkg.value)) || 0;
      return total + (quantity * value);
    }, 0);
    setValue('valueSum', Math.round(totalValue * 100) / 100);
  }, [packages, setValue]);

  // Shipment type default
  useEffect(() => {
    const currentShipmentType = watch('shipment_type');
    if (!currentShipmentType?.id && shipmentTypes.length > 0) {
      const defaultType = shipmentTypes.find((type: any) => type.id === 2) || shipmentTypes[0];
      setValue('shipment_type', {
        id: defaultType.id,
        name: t(`recapStep.shipmentTypes.${defaultType.id}`)
      });
      setSelectedShipmentType(defaultType.id);
    }
  }, [shipmentTypes, setValue, watch, t]);

  // Shipment type change
  const handleShipmentTypeChange = (type: any) => {
    if (type.id === 1) {
      const currentPackages = getValues('packages');
      const totalWeight = calculateTotalWeight(currentPackages);
      setWeightLimitExceeded(totalWeight > 32);
      // Check volume for air transport
      const totalVolume = calculateTotalVolumeFromPkgs(currentPackages);
      const maxVolume = VEHICLE_VOLUME_LIMITS[6] || 0;
      setVolumeLimitExceeded(maxVolume > 0 && totalVolume > maxVolume);
    } else {
      setWeightLimitExceeded(false);
      setVolumeLimitExceeded(false);
    }
    setSelectedShipmentType(type.id);
    setValue('shipment_type', {
      id: type.id,
      name: t(`recapStep.shipmentTypes.${type.id}`)
    });
  };

  // Sync selectedShipmentType with form state (for restoration)
  const shipmentTypeForSync = watch('shipment_type');
  useEffect(() => {
    const typeId = getValues('shipment_type')?.id;
    if (typeId && typeId !== selectedShipmentType) {
      setSelectedShipmentType(typeId);
    }
  }, [shipmentTypeForSync, selectedShipmentType, getValues]);

  // Add package button
  const handleFirstClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const currentShipmentType = getValues('shipment_type');
    const currentPackages = getValues('packages');
    const newPackageWeight = 1;
    if (currentShipmentType?.id === 1) {
      const totalWeight = calculateTotalWeight(currentPackages);
      if (totalWeight + newPackageWeight > 32) {
        return;
      }
    } else if (currentShipmentType?.id === 2) {
      const vehicleId = Number(selectedVehicleType);
      const limitForAdd = TERRESTRIAL_LIMITS[Number(vehicleId)] || 0;
      const totalWeight = calculateTotalWeight(currentPackages);
      if (limitForAdd > 0 && totalWeight + newPackageWeight > limitForAdd) {
        return;
      }
    } else {
      if (fields.length >= 4) {
        return;
      }
    }
    // Volume check before adding a new package
    const vehicleIdForVol = currentShipmentType?.id === 1 ? 6 : Number(selectedVehicleType);
    const maxVolume = VEHICLE_VOLUME_LIMITS[vehicleIdForVol] || 0;
    if (maxVolume > 0) {
      const totalVolume = calculateTotalVolumeFromPkgs(currentPackages);
      const newPackageMinVolume = 24000; // default S size volume 40×30×20
      if (totalVolume + newPackageMinVolume > maxVolume) {
        return;
      }
    }
    const newIndex = fields.length;
    append({
      title: '',
      titleEn: '',
      titleAr: '',
      content: '',
      contentEn: '',
      contentAr: '',
      dimensions: { length: 1, width: 1, height: 1 },
      weight: 1,
      quantity: 1,
      value: 1,
      fragile: false,
      sizeId: 1,
      images: [],
      short_audio: null,
    });
    setCurrentFieldIndex(newIndex);
  };

  // Weight limit effect
  useEffect(() => {
    if (selectedShipmentType === 1) {
      const totalWeight = calculateTotalWeight(fields);
      setWeightLimitExceeded(totalWeight > 32);
      trigger(['packages', 'shipment_type']);
      if (totalWeight > 32) {
        let remainingExcessWeight = totalWeight - 32;
        const sortedPackageIndexes = [...fields]
          .map((pkg, index) => ({ index, weight: (pkg.weight || 0) * (pkg.quantity || 1) }))
          .sort((a, b) => b.weight - a.weight)
          .map(item => item.index);
        for (const index of sortedPackageIndexes) {
          if (remainingExcessWeight > 0) {
            const packageWeight = (fields[index].weight || 0) * (fields[index].quantity || 1);
            if (packageWeight > 0.5) {
              setValue(`packages.${index}.weightError`, `Ce colis contribue au dépassement de la limite de 32kg pour le transport aérien.`);
              remainingExcessWeight -= packageWeight;
            }
          } else {
            setValue(`packages.${index}.weightError`, undefined);
          }
        }
        setError('packages', {
          type: 'custom',
          message: `Le poids total (${totalWeight.toFixed(2)}kg) dépasse la limite de 32kg pour le transport aérien.`
        });
      } else {
        fields.forEach((_, index) => {
          setValue(`packages.${index}.weightError`, undefined);
        });
        clearErrors('packages');
      }
    } else {
      fields.forEach((_, index) => {
        setValue(`packages.${index}.weightError`, undefined);
      });
      clearErrors('packages');
    }

    // Volume limit check (for both air and terrestrial)
    const vehicleId = selectedShipmentType === 1 ? 6 : Number(selectedVehicleType);
    const maxVolume = VEHICLE_VOLUME_LIMITS[vehicleId];
    if (maxVolume) {
      const totalVolume = calculateTotalVolumeFromPkgs(fields);
      setVolumeLimitExceeded(totalVolume > maxVolume);
    } else {
      setVolumeLimitExceeded(false);
    }
  }, [fields, selectedShipmentType, selectedVehicleType, setValue, setError, clearErrors, trigger, calculateTotalWeight, calculateTotalVolumeFromPkgs]);

  // Register validation for shipment_type and packages
  useEffect(() => {
    register('title', {
      required: t('expedier.departureStep.validation.titleRequired'),
      minLength: { value: 3, message: t('expedier.departureStep.validation.titleMinLength') }
    });
    register('shipment_type', {
      validate: (value) => {
        const packages = getValues('packages');
        if (value?.id === 1) {
          const totalWeight = calculateTotalWeight(packages);
          if (totalWeight > 32) {
            return `Pour le transport aérien, le poids total ne peut pas dépasser 32kg. Poids actuel: ${totalWeight.toFixed(2)}kg`;
          }
          // Volume check for air transport
          const totalVolume = calculateTotalVolumeFromPkgs(packages);
          const maxVolume = VEHICLE_VOLUME_LIMITS[6] || 0;
          if (maxVolume > 0 && totalVolume > maxVolume) {
            return t('expedier.departureStep.packages.volumeLimitExceeded.validationError', {
              current: cm3ToLitres(totalVolume),
              max: cm3ToLitres(maxVolume),
            });
          }
        } else if (value?.id === 2) {
          const vehicleId = getValues('subShipmentType.id');
          const limitForValidation = TERRESTRIAL_LIMITS[Number(vehicleId)] || 0;
          const totalWeight = calculateTotalWeight(packages);
          if (limitForValidation > 0 && totalWeight > limitForValidation) {
            return t('expedier.departureStep.packages.weightLimitExceeded.terrestrialError', { limit: limitForValidation });
          }
          // Volume check for terrestrial transport
          const maxVolume = VEHICLE_VOLUME_LIMITS[Number(vehicleId)] || 0;
          const totalVolume = calculateTotalVolumeFromPkgs(packages);
          if (maxVolume > 0 && totalVolume > maxVolume) {
            return t('expedier.departureStep.packages.volumeLimitExceeded.validationError', {
              current: cm3ToLitres(totalVolume),
              max: cm3ToLitres(maxVolume),
            });
          }
        }
        return true;
      }
    });
    register('packages', {
      required: 'Au moins un colis est requis',
      validate: (packages) => {
        if (!packages || packages.length === 0) {
          return 'Au moins un colis est requis';
        }
        
        const currentShipmentType = getValues('shipment_type');
        const vehicleId = currentShipmentType?.id === 1 ? 6 : Number(getValues('subShipmentType.id') || 0);

        // Weight check
        if (currentShipmentType?.id === 1) {
          const totalWeight = calculateTotalWeight(packages);
          if (totalWeight > 32) {
            return t('expedier.departureStep.validation.weightLimitExceeded', { weight: totalWeight.toFixed(2) });
          }
        } else if (currentShipmentType?.id === 2) {
          const limitForSummary = TERRESTRIAL_LIMITS[Number(vehicleId)] || 0;
          const totalWeight = calculateTotalWeight(packages);
          if (limitForSummary > 0 && totalWeight > limitForSummary) {
            return t('expedier.departureStep.packages.weightLimitExceeded.terrestrialError', { limit: limitForSummary });
          }
        }

        // Volume check
        const maxVolume = VEHICLE_VOLUME_LIMITS[vehicleId] || 0;
        if (maxVolume > 0) {
          const totalVolume = calculateTotalVolumeFromPkgs(packages);
          if (totalVolume > maxVolume) {
            return t('expedier.departureStep.packages.volumeLimitExceeded.validationError', {
              current: cm3ToLitres(totalVolume),
              max: cm3ToLitres(maxVolume),
            });
          }
        }

        return true;
      }
    });
    
    // valueSum is optional - no minimum validation needed
    register('valueSum');
  }, [register, getValues, calculateTotalWeight, calculateTotalVolumeFromPkgs, t]);

  // Vehicle types for subShipmentType
  const VEHICLE_TYPES = [
    { id: 1, name: t('transporter.steps.terrestrialTransportInfo.vehicleType.car') },
    { id: 2, name: t('transporter.steps.terrestrialTransportInfo.vehicleType.van') },
    { id: 3, name: t('transporter.steps.terrestrialTransportInfo.vehicleType.truck') },
    { id: 4, name: t('transporter.steps.terrestrialTransportInfo.vehicleType.bus') },
    { id: 5, name: t('transporter.steps.terrestrialTransportInfo.vehicleType.train') },
  ];
  const watchedShipmentType = watch('shipment_type');

  // Keep selectedVehicleType in sync with form value
  useEffect(() => {
    const subTypeId = watch('subShipmentType.id');
    if (subTypeId !== undefined && subTypeId !== selectedVehicleType) {
      setSelectedVehicleType(subTypeId);
    }
  }, [watch, selectedVehicleType]);

  // Remove the title input and instead set the announcement title to the first package's title
  useEffect(() => {
    const subscription = watch((value: any = {}) => {
      if (Array.isArray(value.packages) && value.packages.length > 0) {
        const newTitle = value.packages[0].title || '';
        if (value.title !== newTitle) {
          setValue('title', newTitle);
        }
        // Sync multilingual titles from first package
        const newTitleEn = value.packages[0].titleEn || '';
        if (value.titleEn !== newTitleEn) {
          setValue('titleEn', newTitleEn);
        }
        const newTitleAr = value.packages[0].titleAr || '';
        if (value.titleAr !== newTitleAr) {
          setValue('titleAr', newTitleAr);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  // Sync only the selected package/image indices based on thumbnailId
  // Do NOT auto-sync thumbnailSource - let user button clicks control this
  useEffect(() => {
    if (thumbnailId?.packageImage) {
      // Only sync the indices, not the source - user choice takes precedence
      setSelectedPackageIndex(
        typeof thumbnailId.packageIndex === 'number' ? thumbnailId.packageIndex : null
      );
      setSelectedPackageImageIndex(
        typeof thumbnailId.imageIndex === 'number' ? thumbnailId.imageIndex : null
      );
    }
  }, [thumbnailId?.packageImage, thumbnailId?.packageIndex, thumbnailId?.imageIndex]);

  // Automatically set thumbnail to first package's first image if not set
  // DISABLED: This was interfering with user's explicit upload choice
  // useEffect(() => {
  //   if (Array.isArray(packages) && packages.length > 0) {
  //     // Only run if thumbnailId is not set or empty
  //     if (
  //       !thumbnailId ||
  //       (!thumbnailId.file && !thumbnailId.path && !thumbnailId.packageImage)
  //     ) {
  //       // Find the first package with images
  //       const firstPackageWithImages = packages.find(pkg => Array.isArray(pkg.images) && pkg.images.length > 0);
  //       if (firstPackageWithImages) {
  //         const pkgIndex = packages.indexOf(firstPackageWithImages);
  //         const firstImage = firstPackageWithImages.images[0];
  //         let imageUrl = '';
  //         if (firstImage instanceof File) {
  //           imageUrl = URL.createObjectURL(firstImage);
  //         } else if (typeof firstImage === 'object' && firstImage !== null) {
  //           if ('path' in firstImage && typeof firstImage.path === 'string') {
  //             imageUrl = firstImage.path as string;
  //           } else if ('id' in firstImage && firstImage.id) {
  //             imageUrl = `/api/v1/uploads/${String(firstImage.id)}`;
  //           } else if ('objectURL' in firstImage && typeof firstImage.objectURL === 'string') {
  //             imageUrl = firstImage.objectURL as string;
  //           }
  //         }
  //         // Set the thumbnailId to the first image of the first package with images
  //         setValue('thumbnailId', {
  //           path: imageUrl,
  //           packageImage: true,
  //           packageIndex: pkgIndex,
  //           imageIndex: 0
  //         });
  //       }
  //     }
  //   }
  // }, [packages, thumbnailId, setValue]);

  // Add a useEffect to re-validate when language changes
  useEffect(() => {
    // Re-trigger validation for packages when language changes
    if (fields.length > 0) {
      // This will re-run validation with the new language
      trigger('packages');
    }
  }, [i18n.language, trigger, fields.length]);

  // Automatically scroll to package section when there are errors
  useEffect(() => {
    if (errors.packages && packageContainerRef.current) {
      packageContainerRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      
      // Show error toast
      toast({
        title: t('expedier.departureStep.validation.error'),
        description: t('expedier.departureStep.validation.pleaseFixErrors'),
        variant: 'destructive',
      });
    }
  }, [errors.packages, toast, t]);

  // Update the validatePackages function to properly check packages
  const validatePackages = async () => {
    const packages = getValues('packages') || [];
    
    // Check if we have at least one package
    if (packages.length === 0) {
      setError('packages', {
        type: 'required',
        message: t("expedier.departureStep.validation.packageRequired")
      });
      
      if (packageContainerRef.current) {
        packageContainerRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        
        toast({
          title: t('expedier.departureStep.validation.error'),
          description: t('expedier.departureStep.validation.pleaseFixErrors'),
          variant: 'destructive',
        });
      }
      
      return false;
    }
    
    // Check each package's title
    let isValid = true;
    for (let i = 0; i < packages.length; i++) {
      if (!packages[i].title || packages[i].title.trim() === '') {
        isValid = false;
        setError(`packages.${i}.title`, {
          type: 'required',
          message: t('expedier.departureStep.packages.modal.error')
        });
      } else {
        clearErrors(`packages.${i}.title`);
      }
    }
    
    // If we found a validation error, scroll to the package container
    if (!isValid && packageContainerRef.current) {
      packageContainerRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      
      toast({
        title: t('expedier.departureStep.validation.error'),
        description: t('expedier.departureStep.validation.pleaseFixErrors'),
        variant: 'destructive',
      });
    }
    
    return isValid;
  }

  // Add thumbnailId validation to the form
  useEffect(() => {
    // Validate thumbnailId on submit or when packages/images change
    const validateThumbnail = () => {
      // Thumbnail is required if there is at least one package with images
      const hasPackageWithImages = Array.isArray(packages) && packages.some(pkg => Array.isArray(pkg.images) && pkg.images.length > 0);
      if (hasPackageWithImages) {
        if (!thumbnailId || (!thumbnailId.file && !thumbnailId.path && !thumbnailId.packageImage)) {
          setError('thumbnailId', {
            type: 'required',
            message: t('expedier.departureStep.thumbnailSelection.required', 'Une image de couverture est requise')
          });
          return false;
        } else {
          clearErrors('thumbnailId');
          return true;
        }
      } else {
        clearErrors('thumbnailId');
        return true;
      }
    };

    // Validate on mount and when packages/images/thumbnailId change
    validateThumbnail();
  }, [packages, thumbnailId, setError, clearErrors, t]);

  // Set subShipmentType to Plane (id 6) when shipment_type.id is 1 (avion)
  useEffect(() => {
    if (selectedShipmentType === 1) {
      setValue('subShipmentType', { id: 6, name: 'Avion', nameEn: 'Plane', nameAr: 'طائرة' });
      setSelectedVehicleType(6);
    }
  }, [selectedShipmentType, setValue]);

  // Main return JSX
  return (
    <div className="flex flex-col gap-6">
      {/* Title input removed. Announcement title will be set to the first package's title. */}

      {/* Shipment Type */}
      <div>
        <Label htmlFor="shipmentTypeId">{t("expedier.departureStep.shipmentType")} <span className="text-red-600">*</span> :</Label>
        <Select
          onValueChange={(value) => {
            const typeId = Number(value);
            const selectedType = shipmentTypes.find((type: any) => type.id === typeId);
            if (selectedType) {
              handleShipmentTypeChange(selectedType);
            }
          }}
          value={String(selectedShipmentType)}
        >
          <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <SelectValue placeholder={t("expedier.departureStep.shipmentTypeSelect")}>
              {selectedShipmentType && t(`recapStep.shipmentTypes.${selectedShipmentType}`)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Array.isArray(shipmentTypes) && shipmentTypes.map((type: any) => (
              <SelectItem key={type.id} value={String(type.id)}>
                {t(`recapStep.shipmentTypes.${type.id}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.shipment_type && (
          <p className="text-sm font-medium text-red-600">{errors.shipment_type.message}</p>
        )}
      </div>
      {/* Vehicle Type Selection - only for terrestrial transport */}
      {watchedShipmentType?.id === 2 && (
        <div>
          <Label>{t('transporter.steps.terrestrialTransportInfo.vehicleType.label')} <span className="text-red-600">*</span></Label>
          <Select
            onValueChange={(value) => {
              setValue('subShipmentType.id', Number(value));
              setSelectedVehicleType(Number(value));
            }}
            value={String(selectedVehicleType || '')}
            {...register('subShipmentType.id', {
              required: watchedShipmentType?.id === 2 ? t('transporter.steps.terrestrialTransportInfo.vehicleType.required') : false
            })}
          >
            <SelectTrigger 
              className={cn(
                "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
                errors.subShipmentType ? 'border-red-500 focus:ring-red-500 dark:border-red-700 dark:focus:ring-red-600' : ''
              )}
              id="vehicle-type-select"
            >
              <SelectValue placeholder={t('transporter.steps.terrestrialTransportInfo.vehicleType.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              {VEHICLE_TYPES.map((type) => (
                <SelectItem key={type.id} value={String(type.id)}>{type.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.subShipmentType && (
            <span className="text-sm text-red-600">
              {(errors.subShipmentType as any)?.id?.message}
            </span>
          )}
          {/* Vehicle type indicator */}
          <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">{t('transporter.steps.terrestrialTransportInfo.weightLimits.title')}</span>
            </p>
            <ul className="list-disc pl-5 text-xs space-y-1 text-gray-500 dark:text-gray-400 mt-1">
              <li className={cn('', selectedVehicleType === 1 ? 'font-semibold text-teal-600 dark:text-teal-400' : '')}>{t('transporter.steps.terrestrialTransportInfo.weightLimits.car')}</li>
              <li className={cn('', selectedVehicleType === 2 ? 'font-semibold text-teal-600 dark:text-teal-400' : '')}>{t('transporter.steps.terrestrialTransportInfo.weightLimits.van')}</li>
              <li className={cn('', selectedVehicleType === 3 ? 'font-semibold text-teal-600 dark:text-teal-400' : '')}>{t('transporter.steps.terrestrialTransportInfo.weightLimits.truck')}</li>
              <li className={cn('', selectedVehicleType === 4 ? 'font-semibold text-teal-600 dark:text-teal-400' : '')}>{t('transporter.steps.terrestrialTransportInfo.weightLimits.bus')}</li>
              <li className={cn('', selectedVehicleType === 5 ? 'font-semibold text-teal-600 dark:text-teal-400' : '')}>{t('transporter.steps.terrestrialTransportInfo.weightLimits.train')}</li>
            </ul>
          </div>
        </div>
      )}
      {/* Show weight warning banner when switching to air transport with excess weight */}
      {selectedShipmentType === 1 && weightLimitExceeded && (
        <div className="mt-4 bg-red-50 dark:bg-red-950/30 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                {t("expedier.departureStep.packages.weightLimitExceeded.title")}
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-400">
                <p>
                  {t("expedier.departureStep.packages.weightLimitExceeded.message", { weight: calculateTotalWeight(fields).toFixed(2) })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Volume limit exceeded banner */}
      {volumeLimitExceeded && (
        <div className="mt-4 bg-red-50 dark:bg-red-950/30 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                {t("expedier.departureStep.packages.volumeLimitExceeded.title")}
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-400">
                <p>
                  {t("expedier.departureStep.packages.volumeLimitExceeded.message")}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Package Section */}
      <div className="relative pt-4" ref={packageContainerRef}>
        {/* Inline PackagesOptions replaces modal and ColisListing */}
        <PackagesOptions />
        {/* Show weight warning banner when switching to air transport with excess weight */}
        {selectedShipmentType === 1 && weightLimitExceeded && (
          <div className="mt-4 bg-red-50 dark:bg-red-950/30 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                  {t("expedier.departureStep.packages.weightLimitExceeded.title")}
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-400">
                  <p>
                    {t("expedier.departureStep.packages.weightLimitExceeded.message", { weight: calculateTotalWeight(fields).toFixed(2) })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Air transport weight error message */}
        {selectedShipmentType === 1 && weightLimitExceeded && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800 dark:text-red-300">
                  {t("expedier.departureStep.packages.weightLimitExceeded.title")}
                </h4>
                <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                  {t("expedier.departureStep.packages.weightLimitExceeded.message", { weight: calculateTotalWeight(fields).toFixed(2) })}
                </p>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="font-medium text-red-700 dark:text-red-400">
                    {t("expedier.departureStep.packages.weightLimitExceeded.currentWeight", { weight: calculateTotalWeight(fields).toFixed(2) })}
                  </span>
                  <span className="font-medium text-red-700 dark:text-red-400">
                    {t("expedier.departureStep.packages.weightLimitExceeded.maxWeight")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        {errors.packages?.message && selectedShipmentType === 1 && (
          <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">
            {errors.packages.message}
          </p>
        )}
        {/* Total Value Display */}
        {/* {fields.length > 0 && (
          <div className="mt-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-full bg-teal-100 dark:bg-teal-900/50">
                </span>
                <span className="font-medium text-gray-700 dark:text-gray-200">{t("expedier.departureStep.packages.totalValue")}</span>
              </div>
              <div className="text-xl font-bold text-teal-600 dark:text-teal-400">
                {`${Number(valueSum).toFixed(2)} €`}
              </div>
            </div> */}
            {/* Show total weight for air or terrestrial transport */}
            {/* {(selectedShipmentType === 1 || selectedShipmentType === 2) && (
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/50">
                  </span>
                  <span className="font-medium text-gray-700 dark:text-gray-200">{t("expedier.departureStep.packages.totalWeight")}</span>
                </div>
                <div className="flex items-center">
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {`${calculateTotalWeight(fields).toFixed(2)} kg`}
                  </div>
                  <div className={`ml-2 text-xs font-medium px-2 py-1 rounded-full ${(() => {
                      if (selectedShipmentType === 1) {
                        return calculateTotalWeight(fields) > 32
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
                      } else if (selectedShipmentType === 2) {
                        const limitForSummary = TERRESTRIAL_LIMITS[Number(selectedVehicleType)] || 0;
                        return calculateTotalWeight(fields) > limitForSummary && limitForSummary > 0
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
                      }
                      return '';
                    })()
                    }`}>
                    {(() => {
                      if (selectedShipmentType === 1) {
                        return calculateTotalWeight(fields) > 32
                          ? `Dépassé (max 32kg)`
                          : `Limite: 32kg`;
                      } else if (selectedShipmentType === 2) {
                        const limitForSummary = TERRESTRIAL_LIMITS[Number(selectedVehicleType)] || 0;
                        return calculateTotalWeight(fields) > limitForSummary && limitForSummary > 0
                          ? t('expedier.departureStep.packages.weightLimitExceeded.terrestrialError', { limit: limitForSummary })
                          : `Limite: ${limitForSummary}kg`;
                      }
                      return '';
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
                {/* Thumbnail Selection Section - Only show when at least one package has images */}
                {(() => {
          // Check if any package has images
          const hasPackageWithImages = Array.isArray(packages) && 
            packages.some(pkg => Array.isArray(pkg.images) && pkg.images.length > 0);
          
          if (!hasPackageWithImages) {
            return null; // Don't display the section if no package has images
          }
          
          return (
            <div className="mt-2 pt-6 border-t border-dashed border-gray-200 dark:border-gray-700" ref={thumbnailSectionRef}>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <span className="p-1.5 rounded-md bg-gradient-to-tr from-primary-500/20 to-primary-400/10">
                    </span>
                    {t("expedier.departureStep.thumbnailSelection.title")}
                  </h3>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
                        <InfoIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {t("expedier.departureStep.thumbnailSelection.infoNewPhoto")}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex gap-2 mb-4">
                      <button
                        type="button"
                        className={cn(
                          'px-3 py-1 rounded-md font-medium transition-colors',
                          thumbnailSource === 'upload'
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        )}
                        onClick={() => {
                          setThumbnailSource('upload');
                          // Clear package selection when switching to upload mode
                          setSelectedPackageIndex(null);
                          setSelectedPackageImageIndex(null);
                        }}
                      >
                        {t('expedier.departureStep.thumbnailSelection.upload')}
                      </button>
                      <button
                        type="button"
                        className={cn(
                          'px-3 py-1 rounded-md font-medium transition-colors',
                          thumbnailSource === 'package'
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        )}
                        onClick={() => setThumbnailSource('package')}
                      >
                        {t('expedier.departureStep.thumbnailSelection.fromPackages')}
                      </button>
                    </div>
                    {thumbnailSource === 'package' ? (
                      <div>
                        <div className="space-y-3">
                          {Array.isArray(packages) && packages.map((pkg, pkgIndex) => {
                            const packageImages = pkg.images || [];
                            if (packageImages.length === 0) return null;
                            return (
                              <div key={pkg.id || pkgIndex} className="overflow-hidden">
                                <div className="flex items-center mb-1.5 md:mb-2">
                                  <h4 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium truncate max-w-[140px] sm:max-w-none">{pkg.title}</h4>
                                  <div className="h-px bg-gray-200 dark:bg-gray-700 flex-grow ml-2"></div>
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-1.5 md:gap-2">
                                  {packageImages.map((image, imgIndex) => {
                                    const imageUrl = resolvePackageImageUrl(image);
                                    const isSelected = selectedPackageIndex === pkgIndex && selectedPackageImageIndex === imgIndex;
                                    return (
                                      <div
                                        key={`${pkgIndex}-${imgIndex}`}
                                        className={cn(
                                          "relative aspect-square cursor-pointer rounded-md overflow-hidden transition-all duration-200",
                                          isSelected
                                            ? "ring-2 ring-primary shadow-md transform scale-[0.95]"
                                            : "hover:ring-1 hover:ring-gray-300 dark:hover:ring-gray-600 hover:scale-95"
                                        )}
                                        onClick={() => {
                                          setSelectedPackageImageIndex(imgIndex);
                                          setSelectedPackageIndex(pkgIndex);
                                          setValue('thumbnailId', {
                                            path: imageUrl,
                                            packageImage: true,
                                            packageIndex: pkgIndex,
                                            imageIndex: imgIndex
                                          });
                                        }}
                                      >
                                        {imageUrl ? (
                                          <>
                                            <Image
                                              src={imageUrl}
                                              alt={`Image ${imgIndex + 1} of ${pkg.title}`}
                                              width={200}
                                              height={200}
                                              className="w-full h-full object-cover"
                                            />
                                            {isSelected && (
                                              <div className="absolute inset-0 bg-primary/20 backdrop-blur-[1px] flex items-center justify-center">
                                                <div className="bg-white dark:bg-gray-800 rounded-full shadow-md p-1.5">
                                                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                  </svg>
                                                </div>
                                              </div>
                                            )}
                                          </>
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                                            <span className="text-gray-500 dark:text-gray-400 text-xs">No preview</span>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {selectedPackageIndex !== null && selectedPackageImageIndex !== null && (
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mt-3">
                            <div>
                              <div className="flex items-center">
                                <span className="inline-flex h-2 w-2 mr-1.5 rounded-full bg-primary-500 flex-shrink-0"></span>
                                <p className="text-xs font-medium truncate text-gray-900 dark:text-gray-100">
                                  {t("expedier.departureStep.thumbnailSelection.selected")}
                                </p>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
                                {t("expedier.departureStep.thumbnailSelection.description")}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <Label htmlFor={`thumbnail`} className="text-sm font-medium mb-1.5 block">
                          Télécharger une photo <span className="text-red-600">*</span>
                        </Label>
                        <FileUpload
                          registerName="thumbnail"
                          multiple={false}
                          existingImages={
                            thumbnailId && (thumbnailId.path || thumbnailId.id) && !thumbnailId.file && !thumbnailId.packageImage
                              ? [thumbnailId]
                              : []
                          }
                          onFileChange={(files) => {
                            if (files && files.length > 0) {
                              setValue('thumbnailId', {
                                file: files[0],
                                path: '',
                                id: ''
                              });
                              setSelectedPackageImageIndex(null);
                              setSelectedPackageIndex(null);
                              console.log('Thumbnail file set:', files[0].name);
                            } else {
                              setValue('thumbnailId', { file: undefined, path: '', id: '' });
                              setSelectedPackageImageIndex(null);
                              setSelectedPackageIndex(null);
                              console.log('Thumbnail file cleared');
                            }
                          }}
                        />
                      </div>
                    )}
                    {errors.thumbnailId && (
                      <p className="text-sm font-medium text-red-600 mt-2">
                        Une image de couverture est requise
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
        {/* Audio Recording Section - hidden on first step per request */}
        {/*
        <div className="my-8 border-t border-dashed border-gray-200 dark:border-gray-700 pt-8">
          <Label htmlFor="short_audio" className="font-semibold text-base">{t("expedier.departureStep.audioRecording")} :</Label>
          <p className="text-xs text-gray-500 mb-2">{t("expedier.departureStep.audioRecordingInfo", "Ajoutez un message vocal pour décrire vos colis (optionnel).")}</p>
          <AudioRecorderWithVisualizer
            onChange={(file) => {
              if (file) {
                const audioId =
                  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
                    ? crypto.randomUUID()
                    : `audio-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
                setValue('shortAudio', {
                  id: audioId,
                  path: URL.createObjectURL(file)
                });
              } else {
                setValue('shortAudio', null);
              }
            }}
          />
        </div>
        */}
      </div>
      {/* Register thumbnailId as a required field for react-hook-form validation */}
      <input
        type="hidden"
        {...register('thumbnailId', {
          required: t('expedier.departureStep.thumbnailSelection.required', 'Une image de couverture est requise'),
          validate: v => (v && (v.file || v.path || v.packageImage)) ? true : t('expedier.departureStep.thumbnailSelection.required', 'Une image de couverture est requise')
        })}
        value={thumbnailId ? JSON.stringify(thumbnailId) : ''}
        readOnly
      />
    </div>
  );
}
