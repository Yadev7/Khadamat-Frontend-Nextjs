import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { WeightInput } from '@/components/ui/WeightInput';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Trash2, 
  Package as PackageIcon, 
  AlertCircle, 
  Info as InfoIcon, 
  Check, 
  XCircle, 
  Ruler, 
  Grid3X3,
  ChevronDown,
  ChevronUp,
  Scale,
  Box,
  ShoppingBag,
  Briefcase,
  Luggage,
  Armchair,
  MoveHorizontal,
  MoveDiagonal,
  MoveVertical
} from 'lucide-react';
import FileUpload from '@/components/ui/file-upload';
import { TranslatableInput, TranslatableLanguage, LanguageToggle } from '@/components/ui/TranslatableInput';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { StepperFormValues, Package } from '@/types/stepper';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import {
  SIZE_DIMENSIONS as IMPORTED_SIZE_DIMENSIONS,
  VEHICLE_WEIGHT_LIMITS,
  VEHICLE_DIMENSION_LIMITS,
  VEHICLE_SIZE_COMPATIBILITY,
  VEHICLE_VOLUME_LIMITS,
  getAllowedSizesForVehicle,
  calculateTotalPackagesVolume,
  cm3ToLitres,
  checkPackageFitsVehicle,
} from '@/utils/dimensionValidation';
import packageTitleSuggestions from '@/data/package-title-suggestions.json';

// Re-export so the rest of the file keeps working unchanged
const SIZE_DIMENSIONS = IMPORTED_SIZE_DIMENSIONS;

// Predefined size examples to help users identify the right size
const PREDEFINED_SIZE_EXAMPLES: Record<number, { icon: React.ElementType<{ className?: string }>; examplesFr: string; examplesEn: string; examplesAr: string; color: string; bgColor: string; borderColor: string }> = {
  1: {
    icon: ShoppingBag,
    examplesFr: 'Chaussures, livres, petit sac',
    examplesEn: 'Shoes, books, small bag',
    examplesAr: 'أحذية، كتب، حقيبة صغيرة',
    color: 'text-emerald-700 dark:text-emerald-300',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    borderColor: 'border-emerald-200 dark:border-emerald-700/40',
  },
  2: {
    icon: Briefcase,
    examplesFr: 'Valise cabine, ordinateur, sac de sport',
    examplesEn: 'Carry-on, laptop, gym bag',
    examplesAr: 'حقيبة يد، حاسوب، حقيبة رياضية',
    color: 'text-blue-700 dark:text-blue-300',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-700/40',
  },
  3: {
    icon: Luggage,
    examplesFr: 'Grande valise, carton de déménagement',
    examplesEn: 'Large suitcase, moving box',
    examplesAr: 'حقيبة سفر كبيرة، صندوق نقل',
    color: 'text-violet-700 dark:text-violet-300',
    bgColor: 'bg-violet-50 dark:bg-violet-900/20',
    borderColor: 'border-violet-200 dark:border-violet-700/40',
  },
  4: {
    icon: Armchair,
    examplesFr: 'Meuble emballé, grand carton, TV',
    examplesEn: 'Packed furniture, large box, TV',
    examplesAr: 'أثاث معبأ، صندوق كبير، تلفاز',
    color: 'text-amber-700 dark:text-amber-300',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-700/40',
  },
};

const TERRESTRIAL_LIMITS: Record<number, number> = {
  1: VEHICLE_WEIGHT_LIMITS[1],   // Car:   550 kg
  2: VEHICLE_WEIGHT_LIMITS[2],   // Van:   1 500 kg
  3: VEHICLE_WEIGHT_LIMITS[3],   // Truck: 4 500 kg
  4: VEHICLE_WEIGHT_LIMITS[4],   // Bus:   30 kg
  5: VEHICLE_WEIGHT_LIMITS[5],   // Train: 40 kg
};

const PACKAGE_TITLE_SUGGESTIONS = packageTitleSuggestions as string[];

const PREDEFINED_WEIGHT_OPTIONS = [5, 15, 30, 60, 100] as const;

export function PackagesOptions() {
  const { t, i18n } = useTranslation();
  const { sizes } = useSelector((state: RootState) => state.website);
  const {
    control,
    register,
    setValue,
    watch,
    getValues,
    formState: { errors },
    trigger,
    clearErrors,
    setError
  } = useFormContext<StepperFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'packages',
  });
  const selectedShipmentType = watch('shipment_type.id');
  const selectedVehicleType = watch('subShipmentType.id');
  const [expanded, setExpanded] = useState<number | null>(0);
  const [selectedSizes, setSelectedSizes] = useState<Record<number, any>>({});
  const [dimensionErrors, setDimensionErrors] = useState<Record<number, {length?: boolean, width?: boolean, height?: boolean}>>({});
  const [currentLanguage, setCurrentLanguage] = useState<string>(i18n.language);
  const [activePhotoGuideFor, setActivePhotoGuideFor] = useState<number | null>(null);
  const [photoGuideConsulted, setPhotoGuideConsulted] = useState<Record<number, boolean>>({});
  // Track active language per package card to synchronize Title/Description inputs
  const [packageLanguages, setPackageLanguages] = useState<Record<number, TranslatableLanguage>>({});
  // Track dimension input mode per package: 'predefined' (size cards) or 'custom' (free inputs)
  const [dimensionModes, setDimensionModes] = useState<Record<number, 'predefined' | 'custom'>>({});
  const packages = watch('packages');
  const hasShownAirDowngradeToastRef = useRef(false);

  const photoGuideTips = useMemo(
    () => [
      {
        key: 'angle',
        title: t('expedier.departureStep.packages.modal.photos.guide.angle.title', 'Angle utile'),
        description: t('expedier.departureStep.packages.modal.photos.guide.angle.description', 'Prenez la photo en biais 3/4 pour montrer volume, forme et ouvertures du colis.'),
      },
      {
        key: 'lighting',
        title: t('expedier.departureStep.packages.modal.photos.guide.lighting.title', 'Luminosite nette'),
        description: t('expedier.departureStep.packages.modal.photos.guide.lighting.description', 'Placez le colis pres d une source de lumiere naturelle et evitez le contre-jour.'),
      },
      {
        key: 'framing',
        title: t('expedier.departureStep.packages.modal.photos.guide.framing.title', 'Cadrage propre'),
        description: t('expedier.departureStep.packages.modal.photos.guide.framing.description', 'Cadrez le colis au centre, laissez une petite marge, et gardez l horizon droit.'),
      },
      {
        key: 'background',
        title: t('expedier.departureStep.packages.modal.photos.guide.background.title', 'Fond neutre'),
        description: t('expedier.departureStep.packages.modal.photos.guide.background.description', 'Utilisez un fond uni et degage pour faciliter la lecture du colis.'),
      },
    ],
    [t],
  );

  const photoGuideExamples = useMemo(
    () => [
      {
        key: 'bad',
        src: '/item-photo-bad-example.svg',
        label: t('expedier.departureStep.packages.modal.photos.guide.badLabel', 'Non conforme'),
        alt: t('expedier.departureStep.packages.modal.photos.guide.badAlt', 'Exemple de photo non conforme d un objet a transporter'),
        tone: 'neutral' as const,
      },
      {
        key: 'good',
        src: '/item-photo-good-example.svg',
        label: t('expedier.departureStep.packages.modal.photos.guide.goodLabel', 'Ideale'),
        alt: t('expedier.departureStep.packages.modal.photos.guide.goodAlt', 'Exemple de photo ideale d un objet a transporter'),
        tone: 'success' as const,
      },
    ],
    [t],
  );

  const getPackageFieldKey = (base: 'title' | 'content', lang: TranslatableLanguage) => {
    if (base === 'title') {
      if (lang === 'en') return 'titleEn' as const;
      if (lang === 'ar') return 'titleAr' as const;
      return 'title' as const;
    }

    if (lang === 'en') return 'contentEn' as const;
    if (lang === 'ar') return 'contentAr' as const;
    return 'content' as const;
  };

  const handlePackageLanguageChange = useCallback(async (idx: number, nextLanguage: TranslatableLanguage) => {
    const defaultLang = (['fr', 'en', 'ar'].includes(i18n.language)
      ? i18n.language
      : 'fr') as TranslatableLanguage;

    const currentLanguage = packageLanguages[idx] || defaultLang;
    if (nextLanguage === currentLanguage) {
      setPackageLanguages(prev => ({ ...prev, [idx]: nextLanguage }));
      return;
    }

    const pkg = getValues(`packages.${idx}` as const) as Package | undefined;
    if (!pkg) {
      setPackageLanguages(prev => ({ ...prev, [idx]: nextLanguage }));
      return;
    }

    const currentTitle = (pkg[getPackageFieldKey('title', currentLanguage)] as string | undefined)?.trim() || '';
    const nextTitle = (pkg[getPackageFieldKey('title', nextLanguage)] as string | undefined)?.trim() || '';
    const currentContent = (pkg[getPackageFieldKey('content', currentLanguage)] as string | undefined)?.trim() || '';
    const nextContent = (pkg[getPackageFieldKey('content', nextLanguage)] as string | undefined)?.trim() || '';

    try {
      const translateModule = await import('translate');
      const translate = translateModule.default;

      if (!nextTitle && currentTitle) {
        const translatedTitle = await translate(currentTitle, { from: currentLanguage, to: nextLanguage });
        if (translatedTitle?.trim()) {
          const targetTitleKey = getPackageFieldKey('title', nextLanguage);
          setValue(`packages.${idx}.${targetTitleKey}`, translatedTitle, { shouldDirty: true });
          if (idx === 0) {
            if (nextLanguage === 'fr') {
              setValue('title', translatedTitle, { shouldDirty: true });
            } else if (nextLanguage === 'en') {
              setValue('titleEn', translatedTitle, { shouldDirty: true });
            } else {
              setValue('titleAr', translatedTitle, { shouldDirty: true });
            }
          }
        }
      }

      if (!nextContent && currentContent) {
        const translatedContent = await translate(currentContent, { from: currentLanguage, to: nextLanguage });
        if (translatedContent?.trim()) {
          const targetContentKey = getPackageFieldKey('content', nextLanguage);
          setValue(`packages.${idx}.${targetContentKey}`, translatedContent, { shouldDirty: true });
        }
      }
    } catch (error) {
      console.error(
        `Failed to auto-translate package ${idx + 1} from ${currentLanguage} to ${nextLanguage}`,
        error,
      );
    }

    setPackageLanguages(prev => ({ ...prev, [idx]: nextLanguage }));
  }, [getValues, i18n.language, packageLanguages, setValue]);

  // Sync selectedSizes from restored form data (after refresh)
  // Must detect sizeId mismatches, not just empty selectedSizes, because the
  // "ensure at least one package" effect may set a default S before form restoration runs.
  useEffect(() => {
    const pkgs = getValues('packages') || [];
    if (pkgs.length === 0) return;

    let didChange = false;

    setSelectedSizes(prev => {
      const newSizes: Record<number, any> = { ...prev };

      pkgs.forEach((pkg: any, idx: number) => {
        if (pkg?.sizeId) {
          const expected = SIZE_DIMENSIONS[pkg.sizeId];
          const current = prev[idx];
          // Sync if no current selection or current doesn't match the package's sizeId
          if (expected && (!current || current.maxLength !== expected.maxLength || current.maxWidth !== expected.maxWidth || current.maxHeight !== expected.maxHeight)) {
            const sizeFromStore = sizes.find((s: any) => s.id === pkg.sizeId);
            newSizes[idx] = sizeFromStore || expected;
            didChange = true;
          }
        }
      });

      return didChange ? newSizes : prev;
    });

    // After syncing sizes, clear stale dimension errors and re-validate
    // against the correct (restored) size limits so errors don't linger.
    if (didChange) {
      // Re-validate each package's dimensions against its actual size
      const correctedErrors: Record<number, {length?: boolean, width?: boolean, height?: boolean}> = {};
      pkgs.forEach((pkg: any, idx: number) => {
        const size = SIZE_DIMENSIONS[pkg?.sizeId] || SIZE_DIMENSIONS[1];
        const dims = pkg?.dimensions;
        if (dims && size) {
          const lenOk = dims.length > 0 && dims.length <= size.maxLength;
          const widOk = dims.width > 0 && dims.width <= size.maxWidth;
          const hgtOk = dims.height > 0 && dims.height <= size.maxHeight;
          // Only add entry if there's a genuine error
          if (!lenOk || !widOk || !hgtOk) {
            correctedErrors[idx] = {
              length: !lenOk,
              width: !widOk,
              height: !hgtOk,
            };
          }
        }
      });
      setDimensionErrors(correctedErrors);

      // Also clear React Hook Form validation errors for dimensions
      pkgs.forEach((_: any, idx: number) => {
        clearErrors(`packages.${idx}.dimensions.length`);
        clearErrors(`packages.${idx}.dimensions.width`);
        clearErrors(`packages.${idx}.dimensions.height`);
      });
    }
  }, [fields.length, sizes, packages]); // eslint-disable-line react-hooks/exhaustive-deps
  // Compute the allowed size IDs for the current vehicle type
  const allowedSizeIds = useMemo(() => {
    if (selectedShipmentType === 1) {
      // Air mode: keep all cards enabled/visible for UX consistency
      return [1, 2, 3, 4];
    }
    if (selectedShipmentType === 2 && selectedVehicleType) {
      return getAllowedSizesForVehicle(Number(selectedVehicleType));
    }
    // No vehicle selected → allow all sizes
    return [1, 2, 3, 4];
  }, [selectedShipmentType, selectedVehicleType]);

  // Auto-downgrade invalid predefined sizes when switching to air transport.
  // Existing L/XL selections are coerced to M so users don't get stuck with invalid presets.
  useEffect(() => {
    if (selectedShipmentType !== 1) {
      hasShownAirDowngradeToastRef.current = false;
      return;
    }

    const pkgs = getValues('packages') || [];
    if (!pkgs.length) return;

    let didDowngrade = false;

    pkgs.forEach((pkg, idx) => {
      const currentSizeId = Number(pkg?.sizeId || 1);
      if (currentSizeId > 2) {
        const fallbackSizeId = 2; // M
        const fallbackSize = SIZE_DIMENSIONS[fallbackSizeId] || SIZE_DIMENSIONS[1];

        setValue(`packages.${idx}.sizeId`, fallbackSizeId, { shouldDirty: true });
        setValue(`packages.${idx}.dimensions.length`, fallbackSize.maxLength, { shouldDirty: true });
        setValue(`packages.${idx}.dimensions.width`, fallbackSize.maxWidth, { shouldDirty: true });
        setValue(`packages.${idx}.dimensions.height`, fallbackSize.maxHeight, { shouldDirty: true });

        setSelectedSizes(prev => ({ ...prev, [idx]: fallbackSize }));
        setDimensionModes(prev => ({ ...prev, [idx]: 'predefined' }));
        clearErrors(`packages.${idx}.dimensions.length`);
        clearErrors(`packages.${idx}.dimensions.width`);
        clearErrors(`packages.${idx}.dimensions.height`);

        didDowngrade = true;
      }
    });

    if (didDowngrade && !hasShownAirDowngradeToastRef.current) {
      hasShownAirDowngradeToastRef.current = true;
      toast({
        title: t('expedier.departureStep.packages.modal.dimensions.vehicleLimitsTitle'),
        description: t(
          'expedier.departureStep.packages.modal.dimensions.airAutoDowngraded',
          'Pour l\'avion, les tailles non compatibles ont été ajustées automatiquement vers une taille M.'
        ),
      });
    }
  }, [selectedShipmentType, getValues, setValue, clearErrors, t]);
  
  // Add refs for scrolling to invalid fields
  const titleInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  // Add refs for scrolling to image upload sections
  const imageSectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Add refs for description inputs
  const descriptionInputRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
  // Add refs for quantity inputs
  const quantityInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  // Add refs for value inputs
  const valueInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  // Add refs for weight inputs
  const weightInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Update total value whenever package values change
  const updateTotalValue = useCallback(() => {
    const packages = getValues('packages') || [];
    const totalValue = packages.reduce((total, pkg) => {
      const quantity = Number(pkg.quantity) || 1;
      const value = Number(pkg.value) || 0;
      return total + (quantity * value);
    }, 0);
    setValue('valueSum', Math.round(totalValue * 100) / 100);
  }, [getValues, setValue]);

  // Always update valueSum when packages change
  useEffect(() => {
    updateTotalValue();
  }, [packages, updateTotalValue]);

  // Reset refs when fields change
  useEffect(() => {
    // Initialize or resize the refs array to match fields length
    titleInputRefs.current = titleInputRefs.current || [];
    if (titleInputRefs.current.length !== fields.length) {
      titleInputRefs.current = Array(fields.length).fill(null);
    }
  }, [fields.length]);

  // New function to validate both title and description together
  const validateTitleAndDescription = useCallback(() => {
    let isValid = true;
    const packages = getValues('packages') || [];
    const requiredMessage = t('expedier.departureStep.packages.modal.error');
    
    // First check titles and descriptions together
    for (let i = 0; i < packages.length; i++) {
      // Get both title and content from DOM or form state
      const titleEl = titleInputRefs.current[i];
      const contentEl = descriptionInputRefs.current[i];
      
      const titleValue = titleEl ? titleEl.value.trim() : packages[i]?.title?.trim() || '';
      const contentValue = contentEl ? contentEl.value.trim() : packages[i]?.content?.trim() || '';
      const titleEnValue = packages[i]?.titleEn?.trim() || '';
      const titleArValue = packages[i]?.titleAr?.trim() || '';
      const contentEnValue = packages[i]?.contentEn?.trim() || '';
      const contentArValue = packages[i]?.contentAr?.trim() || '';
      
      // Update values in form to ensure they're current
      setValue(`packages.${i}.title`, titleValue);
      setValue(`packages.${i}.content`, contentValue);

      const multilingualChecks = [
        { field: 'title', value: titleValue, lang: 'fr' as TranslatableLanguage },
        { field: 'titleEn', value: titleEnValue, lang: 'en' as TranslatableLanguage },
        { field: 'titleAr', value: titleArValue, lang: 'ar' as TranslatableLanguage },
        { field: 'content', value: contentValue, lang: 'fr' as TranslatableLanguage },
        { field: 'contentEn', value: contentEnValue, lang: 'en' as TranslatableLanguage },
        { field: 'contentAr', value: contentArValue, lang: 'ar' as TranslatableLanguage },
      ] as const;

      const firstMissing = multilingualChecks.find(item => !item.value);

      if (firstMissing) {
        isValid = false;

        const languageLabel =
          firstMissing.lang === 'fr'
            ? t('translatable.languageFrench', 'French (FR)')
            : firstMissing.lang === 'en'
              ? t('translatable.languageEnglish', 'English (EN)')
              : t('translatable.languageArabic', 'Arabic (AR)');

        const fieldLabel =
          firstMissing.field === 'title' || firstMissing.field === 'titleEn' || firstMissing.field === 'titleAr'
            ? t('expedier.departureStep.packages.modal.titleSection', 'Title')
            : t('expedier.departureStep.packages.modal.descriptionSection', 'Description');

        setError(`packages.${i}.${firstMissing.field}` as any, {
          type: 'required',
          message: requiredMessage,
        });

        setExpanded(i);
        setPackageLanguages(prev => ({ ...prev, [i]: firstMissing.lang }));

        if (firstMissing.field === 'title' && titleEl) {
          setTimeout(() => {
            titleEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            titleEl.focus();
          }, 100);
        } else if (firstMissing.field === 'content' && contentEl) {
          setTimeout(() => {
            contentEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            contentEl.focus();
          }, 100);
        }

        toast({
          title: t('expedier.departureStep.validation.error'),
          description: t(
            'expedier.departureStep.validation.missingLanguageField',
            'Package {{index}} is missing {{field}} in {{language}}.',
            {
              index: i + 1,
              field: fieldLabel,
              language: languageLabel,
            }
          ),
          variant: 'destructive',
        });

        break;
      }
      
      // Check if both are empty
      if (!titleValue && !contentValue) {
        isValid = false;
        
        // Set errors for both fields
        setError(`packages.${i}.title`, {
          type: 'required',
          message: requiredMessage
        });
        
        setError(`packages.${i}.content`, {
          type: 'required',
          message: requiredMessage
        });
        
        // Expand accordion
        setExpanded(i);
        
        // Scroll to this package and show an error
        if (titleEl) {
          setTimeout(() => {
            titleEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            titleEl.focus();
            
            const originalBorder = titleEl.style.border;
            titleEl.style.transition = 'all 0.3s ease';
            titleEl.style.border = '2px solid #ef4444';
            
            setTimeout(() => {
              titleEl.style.border = originalBorder;
            }, 2000);
          }, 100);
        }
        
        // Show error toast
        toast({
          title: t('expedier.departureStep.validation.error'),
          description: t('expedier.departureStep.validation.pleaseFixErrors'),
          variant: 'destructive',
        });
        
        break; // Stop at the first error
      }
      
      // Check individual fields
      if (!titleValue) {
        isValid = false;
        setError(`packages.${i}.title`, {
          type: 'required',
          message: requiredMessage
        });
        
        // Expand accordion
        setExpanded(i);
        
        if (titleEl) {
          setTimeout(() => {
            titleEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            titleEl.focus();
            
            const originalBorder = titleEl.style.border;
            titleEl.style.transition = 'all 0.3s ease';
            titleEl.style.border = '2px solid #ef4444';
            
            setTimeout(() => {
              titleEl.style.border = originalBorder;
            }, 2000);
          }, 100);
        }
        
        toast({
          title: t('expedier.departureStep.validation.error'),
          description: t('expedier.departureStep.validation.pleaseFixErrors'),
          variant: 'destructive',
        });
        
        break;
      }
      
      if (!contentValue) {
        isValid = false;
        setError(`packages.${i}.content`, {
          type: 'required',
          message: t('expedier.departureStep.packages.modal.error')
        });
        
        // Expand accordion
        setExpanded(i);
        
        if (contentEl) {
          setTimeout(() => {
            contentEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            contentEl.focus();
            
            const originalBorder = contentEl.style.border;
            contentEl.style.transition = 'all 0.3s ease';
            contentEl.style.border = '2px solid #ef4444';
            
            setTimeout(() => {
              contentEl.style.border = originalBorder;
            }, 2000);
          }, 100);
        }
        
        toast({
          title: t('expedier.departureStep.validation.error'),
          description: t('expedier.departureStep.validation.pleaseFixErrors'),
          variant: 'destructive',
        });
        
        break;
      }
      
      // Clear errors if valid
      clearErrors(`packages.${i}.title`);
      clearErrors(`packages.${i}.titleEn` as any);
      clearErrors(`packages.${i}.titleAr` as any);
      clearErrors(`packages.${i}.content`);
      clearErrors(`packages.${i}.contentEn` as any);
      clearErrors(`packages.${i}.contentAr` as any);
    }
    
    return isValid;
  }, [getValues, setValue, setError, setExpanded, t, clearErrors]);

  // Replace the validateTitles function with this improved version
  const validateTitles = useCallback(() => {
    let isValid = true;
    const packages = getValues('packages') || [];
    
    // Check each package's title
    for (let i = 0; i < packages.length; i++) {
      // Get the actual input DOM element
      const inputEl = titleInputRefs.current[i];
      const value = inputEl ? inputEl.value.trim() : '';
      
      // Update the form value directly to ensure it's current
      setValue(`packages.${i}.title`, value);
      
      // Now check if it's empty
      if (!value) {
        isValid = false;
        setError(`packages.${i}.title`, {
          type: 'required',
          message: t('expedier.departureStep.packages.modal.error')
        });
        
        // If this is the first error found, open the accordion and scroll to it
        if (isValid === false) {
          setExpanded(i);
          
          // Add visual indication and scroll
          if (inputEl) {
            // Add a border highlight
            const originalBorder = inputEl.style.border;
            inputEl.style.transition = 'all 0.3s ease';
            inputEl.style.border = '2px solid #ef4444';
            
            // Scroll the element into view
            setTimeout(() => {
              inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
              inputEl.focus();
              
              // Reset after animation
              setTimeout(() => {
                inputEl.style.border = originalBorder;
              }, 2000);
            }, 100);
          }
        }
      } else {
        // Clear errors for valid fields
        clearErrors(`packages.${i}.title`);
      }
    }
    
    // Show error toast if validation failed
    if (!isValid) {
      // Add toast notification
      toast({
        title: t('expedier.departureStep.validation.error'),
        description: t('expedier.departureStep.validation.pleaseFixErrors'),
        variant: 'destructive',
      });
    }
    
    return isValid;
  }, [getValues, setValue, setError, setExpanded, t, clearErrors]);

  // Effect to re-validate form when language changes
  useEffect(() => {
    if (currentLanguage !== i18n.language) {
      setCurrentLanguage(i18n.language);
      
      // Re-trigger validation for all packages and dimensions
      fields.forEach((_, idx) => {
        trigger(`packages.${idx}.dimensions.length`);
        trigger(`packages.${idx}.dimensions.width`);
        trigger(`packages.${idx}.dimensions.height`);
      });
      
      // Force re-render of error messages
      const currentErrors = { ...dimensionErrors };
      setDimensionErrors({});
      setTimeout(() => {
        setDimensionErrors(currentErrors);
      }, 0);
    }
  }, [i18n.language, fields.length, trigger, currentLanguage, dimensionErrors, fields]);

  // Ensure at least one package exists
  useEffect(() => {
    if (fields.length === 0) {
      const defaultSize = SIZE_DIMENSIONS[1]; // Size S
      append({
        title: '',
        content: '',
        dimensions: { 
          length: defaultSize.maxLength, 
          width: defaultSize.maxWidth, 
          height: defaultSize.maxHeight 
        },
        weight: 1,
        quantity: 1,
        value: '' as any,
        fragile: false,
        sizeId: 1,
        images: [],
        short_audio: null,
      });
      setExpanded(0);
      setSelectedSizes({ 0: defaultSize });
    }
  }, [fields.length, append]);

  useEffect(() => {
    if (!Array.isArray(packages) || packages.length === 0) return;

    const consultedFromImages = packages.reduce((acc, pkg, idx) => {
      if (Array.isArray(pkg?.images) && pkg.images.length > 0) {
        acc[idx] = true;
      }
      return acc;
    }, {} as Record<number, boolean>);

    if (Object.keys(consultedFromImages).length === 0) return;

    setPhotoGuideConsulted(prev => ({
      ...prev,
      ...consultedFromImages,
    }));
  }, [packages]);

  // Calculate whether weight limit is reached
  const isWeightLimitReached = useCallback(() => {
    const pkgs = getValues('packages') || [];
    const totalWeight = pkgs.reduce((total, pkg) => total + ((pkg.weight || 0) * (pkg.quantity || 1)), 0);
    const newPackageMinWeight = 1; // Minimum weight of a new package
    
    if (selectedShipmentType === 1) {
      // Air shipment has 32kg limit
      return totalWeight + newPackageMinWeight > 32;
    } else if (selectedShipmentType === 2) {
      // Terrestrial shipment depends on vehicle type
      const limit = TERRESTRIAL_LIMITS[Number(selectedVehicleType)] || 0;
      return limit > 0 && totalWeight + newPackageMinWeight > limit;
    }
    
    // For other shipment types, limit packages to 4
    if (pkgs.length >= 4) {
      return true;
    }
    
    return false;
  }, [getValues, selectedShipmentType, selectedVehicleType]);

  // Calculate whether volume limit is reached
  const isVolumeLimitReached = useCallback(() => {
    const pkgs = getValues('packages') || [];
    // Determine the applicable vehicle type id
    const vehicleId = selectedShipmentType === 1 ? 6 : Number(selectedVehicleType);
    const maxVolume = VEHICLE_VOLUME_LIMITS[vehicleId];
    if (!maxVolume) return false; // unknown vehicle — no limit
    const totalVolume = calculateTotalPackagesVolume(pkgs);
    // Adding a default S package (40×30×20 = 24 000 cm³) as new package minimum volume
    const newPackageMinVolume = 24000;
    return totalVolume + newPackageMinVolume > maxVolume;
  }, [getValues, selectedShipmentType, selectedVehicleType]);

  // Combined check for add button
  const isLimitReached = useCallback(() => {
    return isWeightLimitReached() || isVolumeLimitReached();
  }, [isWeightLimitReached, isVolumeLimitReached]);

  // Add new package
  const handleAdd = () => {
    // Abort if weight or volume limit reached
    if (isLimitReached()) {
      const isVolumeIssue = isVolumeLimitReached() && !isWeightLimitReached();
      toast({
        title: isVolumeIssue
          ? t('expedier.departureStep.packages.volumeLimitExceeded.title')
          : t('expedier.departureStep.packages.weightLimitExceeded.title'),
        description: isVolumeIssue
          ? t('expedier.departureStep.packages.volumeLimitExceeded.message')
          : (selectedShipmentType === 1 
            ? t('expedier.departureStep.packages.weightLimitExceeded.message', { weight: '32' }) 
            : t('expedier.departureStep.packages.weightLimitExceeded.terrestrialError', { limit: TERRESTRIAL_LIMITS[selectedVehicleType] || 0 })),
        variant: 'destructive',
      });
      return;
    }
    
    const defaultSize = SIZE_DIMENSIONS[1]; // Size S
    append({
      title: '',
      content: '',
      dimensions: { 
        length: defaultSize.maxLength, 
        width: defaultSize.maxWidth, 
        height: defaultSize.maxHeight 
      },
      weight: 1,
      quantity: 1,
      value: '' as any,
      fragile: false,
      sizeId: 1,
      images: [],
      short_audio: null,
    });
    const newIndex = fields.length;
    setExpanded(newIndex);
    setSelectedSizes(prev => ({ ...prev, [newIndex]: defaultSize }));
    // Update total value after adding package
    setTimeout(updateTotalValue, 0);
  };

  // Remove package (but not if only one left)
  const handleRemove = (idx: number) => {
    if (fields.length > 1) {
      remove(idx);
      setExpanded((prev) => {
        if (prev === idx) return 0;
        if (prev && prev > idx) return prev - 1;
        return prev;
      });
      // Clean up selectedSizes and dimensionErrors
      const newSelectedSizes = { ...selectedSizes };
      delete newSelectedSizes[idx];
      setSelectedSizes(
        Object.entries(newSelectedSizes).reduce((acc, [key, value]) => {
          const numKey = parseInt(key);
          acc[numKey > idx ? numKey - 1 : numKey] = value;
          return acc;
        }, {} as Record<number, any>)
      );
      const newDimensionErrors = { ...dimensionErrors };
      delete newDimensionErrors[idx];
      setDimensionErrors(
        Object.entries(newDimensionErrors).reduce((acc, [key, value]) => {
          const numKey = parseInt(key);
          acc[numKey > idx ? numKey - 1 : numKey] = value;
          return acc;
        }, {} as Record<number, {length?: boolean, width?: boolean, height?: boolean}>)
      );
      // Clean up dimensionModes
      const newDimensionModes = { ...dimensionModes };
      delete newDimensionModes[idx];
      setDimensionModes(
        Object.entries(newDimensionModes).reduce((acc, [key, value]) => {
          const numKey = parseInt(key);
          acc[numKey > idx ? numKey - 1 : numKey] = value;
          return acc;
        }, {} as Record<number, 'predefined' | 'custom'>)
      );
      const newPhotoGuideConsulted = { ...photoGuideConsulted };
      delete newPhotoGuideConsulted[idx];
      setPhotoGuideConsulted(
        Object.entries(newPhotoGuideConsulted).reduce((acc, [key, value]) => {
          const numKey = parseInt(key);
          acc[numKey > idx ? numKey - 1 : numKey] = value;
          return acc;
        }, {} as Record<number, boolean>)
      );
      setActivePhotoGuideFor((prev) => {
        if (prev === idx) return null;
        if (typeof prev === 'number' && prev > idx) return prev - 1;
        return prev;
      });
      // Update valueSum after removing package
      setTimeout(updateTotalValue, 0);
    }
  };

  // Handle size select (from predefined cards)
  const handleSizeSelect = (idx: number, sizeId: string) => {
    const sizeIdNum = parseInt(sizeId);
    // Use either the size from the backend or our predefined dimensions
    const selected = SIZE_DIMENSIONS[sizeIdNum] || sizes.find((size: any) => size.id === sizeIdNum);
    
    if (selected) {
      // Update selected size in state
      setSelectedSizes((prev) => ({ ...prev, [idx]: selected }));
      setValue(`packages.${idx}.sizeId`, sizeIdNum);
      // Ensure mode is predefined
      setDimensionModes(prev => ({ ...prev, [idx]: 'predefined' }));
      
      // Set each dimension field individually so registered inputs update in the DOM
      setValue(`packages.${idx}.dimensions.length`, selected.maxLength, { shouldDirty: true });
      setValue(`packages.${idx}.dimensions.width`, selected.maxWidth, { shouldDirty: true });
      setValue(`packages.${idx}.dimensions.height`, selected.maxHeight, { shouldDirty: true });
      
      // Ensure no dimension errors are shown
      setDimensionErrors(prev => ({
        ...prev,
        [idx]: { length: false, width: false, height: false }
      }));
      
      // Revalidate each field so error messages clear
      setTimeout(() => {
        trigger(`packages.${idx}.dimensions.length`);
        trigger(`packages.${idx}.dimensions.width`);
        trigger(`packages.${idx}.dimensions.height`);
      }, 0);
    }
  };

  // Get the maximum dimension limits for current mode and vehicle
  const getCustomMaxDimension = useCallback((dimension: 'length' | 'width' | 'height'): number => {
    const vehicleId = selectedShipmentType === 1 ? 6 : Number(selectedVehicleType);
    const vehicleLimits = VEHICLE_DIMENSION_LIMITS[vehicleId];
    if (vehicleLimits) return vehicleLimits[dimension];
    // Fallback: largest predefined size XL
    const dimToMax = { length: 'maxLength', width: 'maxWidth', height: 'maxHeight' } as const;
    return SIZE_DIMENSIONS[4][dimToMax[dimension]];
  }, [selectedShipmentType, selectedVehicleType]);

  // Validate and handle dimension changes
  const handleDimensionChange = (idx: number, dimension: 'length' | 'width' | 'height', value: number) => {
    const mode = dimensionModes[idx] || 'predefined';
    const pkg = getValues(`packages.${idx}`);
    
    let maxValue: number;
    if (mode === 'custom') {
      // In custom mode, validate against vehicle limits (not size limits)
      maxValue = getCustomMaxDimension(dimension);
    } else {
      // In predefined mode, validate against selected size limits
      const size = SIZE_DIMENSIONS[pkg?.sizeId ?? 1] || selectedSizes[idx] || SIZE_DIMENSIONS[1];
      if (!size) return;
      const dimToMax = { length: 'maxLength', width: 'maxWidth', height: 'maxHeight' } as const;
      maxValue = size[dimToMax[dimension]];
    }
    
    // Consider valid only if greater than 0 and within maximum limits
    const isValid = value > 0 && value <= maxValue;
    
    // Always update the form value
    setValue(`packages.${idx}.dimensions.${dimension}`, value);
    
    // Update error state immediately
    setDimensionErrors(prev => ({
      ...prev,
      [idx]: { 
        ...prev[idx],
        [dimension]: !isValid 
      }
    }));
    
    // Trigger validation to update error messages with current language
    setTimeout(() => {
      trigger(`packages.${idx}.dimensions.${dimension}`);
    }, 0);
  };

  // Weight limit logic
  const getMaxWeight = useCallback((idx: number) => {
    const pkgs = getValues('packages') || [];
    const weightWithoutCurrent = pkgs
      .filter((_: any, i: number) => i !== idx)
      .reduce((total: number, pkg: Package) => total + ((pkg.weight || 0) * (pkg.quantity || 1)), 0);
    if (selectedShipmentType === 1) {
      return Math.max(0, 32 - weightWithoutCurrent);
    } else if (selectedShipmentType === 2) {
      const limit = TERRESTRIAL_LIMITS[selectedVehicleType] || 0;
      return Math.max(0, limit - weightWithoutCurrent);
    }
    return 100;
  }, [getValues, selectedShipmentType, selectedVehicleType]);

  const getPredefinedWeightOptions = useCallback(() => PREDEFINED_WEIGHT_OPTIONS, []);

  const handlePredefinedWeightSelect = useCallback((idx: number, weight: number) => {
    setValue(`packages.${idx}.weight`, weight, { shouldDirty: true, shouldValidate: true });

    if (weight <= 0) {
      setError(`packages.${idx}.weight`, {
        type: 'min',
        message: t('expedier.departureStep.packages.modal.weight.greaterThanZero', 'Le poids doit être supérieur à 0')
      });
      return;
    }

    clearErrors(`packages.${idx}.weight`);
  }, [clearErrors, setError, setValue, t]);

  // Expand/collapse logic
  const toggleExpand = (idx: number) => {
    // Before changing the expanded state, make sure current form values are preserved
    if (expanded !== null) {
      const currentPackage = getValues(`packages.${expanded}`);
      if (currentPackage) {
        // Ensure content is saved
        const contentEl = descriptionInputRefs.current[expanded];
        if (contentEl && contentEl.value) {
          setValue(`packages.${expanded}.content`, contentEl.value);
        }
      }
    }
    
    // Set the new expanded state
    setExpanded(expanded === idx ? null : idx);
  };

  // Re-validate fields when language changes (value is optional, skip it)
  useEffect(() => {
    // Value field is optional, no re-validation needed
  }, [i18n.language, fields, trigger, getValues]);

  // Function to scroll to invalid title field
  const scrollToInvalidTitle = useCallback((index: number) => {
    if (titleInputRefs.current[index]) {
      titleInputRefs.current[index]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      // Also ensure the accordion is expanded
      setExpanded(index);
    }
  }, []);

  // Check for errors and scroll to the first invalid field
  useEffect(() => {
    if (errors.packages && Array.isArray(errors.packages)) {
      // Find the first package with a title error
      const errorIndex = errors.packages.findIndex(pkg => pkg?.title);
      if (errorIndex !== -1) {
        scrollToInvalidTitle(errorIndex);
      }
    }
  }, [errors.packages, scrollToInvalidTitle]);

  // Validate and scroll to first package missing images
  const validateImages = useCallback(() => {
    const pkgs = getValues('packages') || [];
    for (let i = 0; i < pkgs.length; i++) {
      if (!pkgs[i].images || pkgs[i].images.length === 0) {
        // Scroll to image section with 75% offset
        const el = imageSectionRefs.current[i];
        if (el) {
          const rect = el.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const offset = window.innerHeight * 0.25;
          window.scrollTo({
            top: rect.top + scrollTop - offset,
            behavior: 'smooth',
          });
          // Highlight
          el.classList.add('ring-2', 'ring-red-500');
          setTimeout(() => el.classList.remove('ring-2', 'ring-red-500'), 2000);
        }
        // Optionally, show a toast
        toast({
          title: t('expedier.departureStep.validation.error'),
          description: t('expedier.departureStep.packages.modal.photos.required'),
          variant: 'destructive',
        });
        return false;
      }
    }
    return true;
  }, [getValues, t]);

  // Add or update the validateDescriptions function
  const validateDescriptions = useCallback(() => {
    let isValid = true;
    // First, ensure any currently focused description is saved to form state
    // This is important for cases where the user didn't trigger an onChange yet
    if (document.activeElement) {
      const activeEl = document.activeElement as HTMLTextAreaElement;
      if (activeEl.tagName === 'TEXTAREA' && activeEl.id.includes('packages')) {
        const idx = descriptionInputRefs.current.findIndex(ref => ref === activeEl);
        if (idx !== -1) {
          setValue(`packages.${idx}.content`, activeEl.value);
        }
      }
    }

    // Now get updated packages from form state
    const packages = getValues('packages') || [];
    for (let i = 0; i < packages.length; i++) {
      // Use the form state value and the input element value, prioritizing the form state
      const inputEl = descriptionInputRefs.current[i];
      // We already have the content in the form state, but double-check with the actual DOM element
      const formValue = packages[i]?.content || '';
      const domValue = inputEl ? inputEl.value.trim() : '';
      
      // Use the latest value available (DOM or form state)
      const finalValue = domValue || formValue;
      setValue(`packages.${i}.content`, finalValue);
      
      if (!finalValue) {
        isValid = false;
        setError(`packages.${i}.content`, {
          type: 'required',
          message: t('expedier.departureStep.packages.modal.error')
        });
        // Expand accordion
        setExpanded(i);
        // Scroll to the description input with 35% offset
        if (inputEl) {
          setTimeout(() => {
            const rect = inputEl.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const offset = window.innerHeight * 0.35;
            window.scrollTo({
              top: rect.top + scrollTop - offset,
              behavior: 'smooth',
            });
            inputEl.focus();
            // Highlight
            const originalBorder = inputEl.style.border;
            inputEl.style.transition = 'all 0.3s ease';
            inputEl.style.border = '2px solid #ef4444';
            setTimeout(() => {
              inputEl.style.border = originalBorder;
            }, 2000);
          }, 100);
        }
        break; // Only scroll to the first error
      } else {
        clearErrors(`packages.${i}.content`);
      }
    }
    if (!isValid) {
      toast({
        title: t('expedier.departureStep.validation.error'),
        description: t('expedier.departureStep.validation.pleaseFixErrors'),
        variant: 'destructive',
      });
    }
    return isValid;
  }, [getValues, setValue, setError, setExpanded, t, clearErrors]);

  // Add or update the validateQuantities function
  const validateQuantities = useCallback(() => {
    let isValid = true;
    const packages = getValues('packages') || [];
    for (let i = 0; i < packages.length; i++) {
      const inputEl = quantityInputRefs.current[i];
      // Do not setValue here, just use the value from form state
      const value = Number(packages[i].quantity);
      if (!value || value < 1) {
        isValid = false;
        setError(`packages.${i}.quantity`, {
          type: 'min',
          message: t('expedier.departureStep.packages.modal.quantityMinError', { min: 1 })
        });
        setExpanded(i);
        if (inputEl) {
          const originalBorder = inputEl.style.border;
          inputEl.style.transition = 'all 0.3s ease';
          inputEl.style.border = '2px solid #ef4444';
          setTimeout(() => {
            inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            inputEl.focus();
            setTimeout(() => {
              inputEl.style.border = originalBorder;
            }, 2000);
          }, 100);
        }
        break; // Only scroll to the first error
      } else {
        clearErrors(`packages.${i}.quantity`);
      }
    }
    if (!isValid) {
      toast({
        title: t('expedier.departureStep.validation.error'),
        description: t('expedier.departureStep.validation.pleaseFixErrors'),
        variant: 'destructive',
      });
    }
    return isValid;
  }, [getValues, setError, setExpanded, t, clearErrors]);

  // validateValues - value field is required
  const validateValues = useCallback(() => {
    let isValid = true;
    const packages = getValues('packages') || [];
    for (let i = 0; i < packages.length; i++) {
      const inputEl = valueInputRefs.current[i];
      const val = packages[i].value;
      
      // Check if value is provided (not empty string, null or undefined)
      // Since it's a number field, 0 is a valid value, but empty string/null/undefined are not
      if ((val as unknown as string) === '' || val === undefined || val === null || isNaN(Number(val))) {
        isValid = false;
        setError(`packages.${i}.value`, {
          type: 'required',
          message: t('expedier.departureStep.packages.modal.error')
        });
        setExpanded(i);
        if (inputEl) {
          const originalBorder = inputEl.style.border;
          inputEl.style.transition = 'all 0.3s ease';
          inputEl.style.border = '2px solid #ef4444';
          setTimeout(() => {
            inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            inputEl.focus();
            setTimeout(() => {
              inputEl.style.border = originalBorder;
            }, 2000);
          }, 100);
        }
        break; // Only scroll to the first error
      } else {
        clearErrors(`packages.${i}.value`);
      }
    }
    if (!isValid) {
      toast({
        title: t('expedier.departureStep.validation.error'),
        description: t('expedier.departureStep.validation.pleaseFixErrors'),
        variant: 'destructive',
      });
    }
    return isValid;
  }, [getValues, setError, setExpanded, t, clearErrors]);

  // Add or update the validateWeights function
  const validateWeights = useCallback(() => {
    let isValid = true;
    const packages = getValues('packages') || [];
    for (let i = 0; i < packages.length; i++) {
      const value = Number(packages[i].weight);
      const inputEl = weightInputRefs.current[i];
      if (!value || value <= 0) {
        isValid = false;
        setError(`packages.${i}.weight`, {
          type: 'min',
          message: t('expedier.departureStep.packages.modal.weight.greaterThanZero', 'Le poids doit être supérieur à 0')
        });
        setExpanded(i);
        if (inputEl) {
          const originalBorder = inputEl.style.border;
          inputEl.style.transition = 'all 0.3s ease';
          inputEl.style.border = '2px solid #ef4444';
          setTimeout(() => {
            inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            inputEl.focus();
            setTimeout(() => {
              inputEl.style.border = originalBorder;
            }, 2000);
          }, 100);
        }
        break; // Only scroll to the first error
      } else {
        clearErrors(`packages.${i}.weight`);
      }
    }
    if (!isValid) {
      toast({
        title: t('expedier.departureStep.validation.error'),
        description: t('expedier.departureStep.validation.pleaseFixErrors'),
        variant: 'destructive',
      });
    }
    return isValid;
  }, [getValues, setError, setExpanded, t, clearErrors]);

  const validateDimensions = useCallback(() => {
    const pkgs = getValues('packages') || [];
    const shipmentTypeId = Number(getValues('shipment_type.id') || getValues('shipment_type')?.id || 0);
    const vehicleId = shipmentTypeId === 1 ? 6 : Number(getValues('subShipmentType.id') || selectedVehicleType || 0);
    const vehicleDims = VEHICLE_DIMENSION_LIMITS[vehicleId];

    if (!vehicleDims) return true;

    for (let i = 0; i < pkgs.length; i++) {
      const dims = pkgs[i]?.dimensions;
      if (!dims) continue;

      const length = Number(dims.length) || 0;
      const width = Number(dims.width) || 0;
      const height = Number(dims.height) || 0;

      const hasNonPositive = length <= 0 || width <= 0 || height <= 0;
      const fit = checkPackageFitsVehicle({ length, width, height }, vehicleId);
      const hasAxisError = !fit.fits;

      if (hasNonPositive || hasAxisError) {
        setExpanded(i);

        setDimensionErrors(prev => ({
          ...prev,
          [i]: {
            length: hasNonPositive ? length <= 0 : fit.length,
            width: hasNonPositive ? width <= 0 : fit.width,
            height: hasNonPositive ? height <= 0 : fit.height,
          }
        }));

        const lengthMessage = length <= 0
          ? t('expedier.departureStep.packages.modal.dimensions.greaterThanZero')
          : (fit.length
            ? t('expedier.departureStep.packages.modal.dimensions.maxError', {
                dimension: t('expedier.departureStep.packages.modal.dimensions.length'),
                max: vehicleDims.length,
              })
            : undefined);

        const widthMessage = width <= 0
          ? t('expedier.departureStep.packages.modal.dimensions.greaterThanZero')
          : (fit.width
            ? t('expedier.departureStep.packages.modal.dimensions.maxError', {
                dimension: t('expedier.departureStep.packages.modal.dimensions.width'),
                max: vehicleDims.width,
              })
            : undefined);

        const heightMessage = height <= 0
          ? t('expedier.departureStep.packages.modal.dimensions.greaterThanZero')
          : (fit.height
            ? t('expedier.departureStep.packages.modal.dimensions.maxError', {
                dimension: t('expedier.departureStep.packages.modal.dimensions.height'),
                max: vehicleDims.height,
              })
            : undefined);

        if (lengthMessage) {
          setError(`packages.${i}.dimensions.length`, { type: 'validate', message: lengthMessage });
        }
        if (widthMessage) {
          setError(`packages.${i}.dimensions.width`, { type: 'validate', message: widthMessage });
        }
        if (heightMessage) {
          setError(`packages.${i}.dimensions.height`, { type: 'validate', message: heightMessage });
        }

        const cardEl = document.querySelector(`[data-package-index="${i}"]`);
        if (cardEl) {
          setTimeout(() => {
            (cardEl as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
        }

        toast({
          title: t('expedier.departureStep.validation.error'),
          description: hasNonPositive
            ? t('expedier.departureStep.packages.modal.dimensions.greaterThanZero')
            : t('expedier.departureStep.packages.modal.dimensions.exceedsVehicle', {
                length: vehicleDims.length,
                width: vehicleDims.width,
                height: vehicleDims.height,
              }),
          variant: 'destructive',
        });

        return false;
      }

      clearErrors(`packages.${i}.dimensions.length`);
      clearErrors(`packages.${i}.dimensions.width`);
      clearErrors(`packages.${i}.dimensions.height`);

      setDimensionErrors(prev => ({
        ...prev,
        [i]: { length: false, width: false, height: false },
      }));
    }

    return true;
  }, [getValues, selectedVehicleType, setExpanded, setError, clearErrors, t]);

  // Expose validateTitles, validateImages, validateDescriptions, validateQuantities, validateValues, validateWeights for external use
  useEffect(() => {
    const rootElement = document.querySelector('.PackagesOptions');
    if (rootElement) {
      (rootElement as any).validateTitles = validateTitles;
      (rootElement as any).validateImages = validateImages;
      (rootElement as any).validateDescriptions = validateDescriptions;
      (rootElement as any).validateQuantities = validateQuantities;
      (rootElement as any).validateValues = validateValues;
      (rootElement as any).validateWeights = validateWeights;
      (rootElement as any).validateDimensions = validateDimensions;
      (rootElement as any).validateTitleAndDescription = validateTitleAndDescription;
    }
    return () => {
      if (rootElement) {
        delete (rootElement as any).validateTitles;
        delete (rootElement as any).validateImages;
        delete (rootElement as any).validateDescriptions;
        delete (rootElement as any).validateQuantities;
        delete (rootElement as any).validateValues;
        delete (rootElement as any).validateWeights;
        delete (rootElement as any).validateDimensions;
        delete (rootElement as any).validateTitleAndDescription;
      }
    };
  }, [validateTitles, validateImages, validateDescriptions, validateQuantities, validateValues, validateWeights, validateDimensions, validateTitleAndDescription]);

  // Add this effect to ensure package descriptions are synced when expanded
  useEffect(() => {
    if (expanded !== null) {
      // When a package is expanded, ensure the content in the textarea reflects the form state
      const currentPackage = getValues(`packages.${expanded}`);
      if (currentPackage) {
        // Small delay to ensure the DOM element is available
        setTimeout(() => {
          const textareaEl = descriptionInputRefs.current[expanded];
          if (textareaEl && currentPackage.content) {
            // Only update if different to avoid cursor position reset
            if (textareaEl.value !== currentPackage.content) {
              textareaEl.value = currentPackage.content;
            }
          }
        }, 50);
      }
    }
  }, [expanded, getValues]);
  
  // Add weight change monitoring for button disable state
  useEffect(() => {
    // Force re-render when packages change to update button disabled state
    const subscription = watch((value, { name }) => {
      if (name?.includes('weight') || name?.includes('quantity') || name === 'packages') {
        // This will trigger a re-render to update the disabled state
        setDimensionErrors({...dimensionErrors});
      }
    });
    
    return () => subscription.unsubscribe();
  }, [watch, dimensionErrors]);

  return (
    <div className="space-y-6 PackagesOptions">
      <div className="flex items-center gap-3 mb-4">
        <span className="inline-flex items-center justify-center rounded-lg bg-gradient-to-tr from-primary-500/10 to-primary-400/10 p-2">
          <PackageIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </span>
        <span className="font-semibold text-lg md:text-xl text-gray-900 dark:text-white tracking-tight">
          {t('expedier.departureStep.packages.title')}
        </span>
      </div>

      {selectedShipmentType === 1 ? (
        <div className="mb-4">
          <div className="relative overflow-hidden rounded-xl border border-red-200/50 dark:border-red-500/20 bg-white dark:bg-gray-900">
            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-red-500 to-red-400" />
            <div className="p-5 pl-7">
              <div className="flex items-start gap-3.5">
                <div className="flex-shrink-0">
                  <div className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                    <AlertCircle className="h-4.5 w-4.5 text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <div>
                  <p className="text-[15px] text-gray-900 dark:text-gray-100">
                    <span className="font-medium">{t('expedier.departureStep.airTransportWarning.title')}</span> {t('expedier.departureStep.airTransportWarning.requirements')}
                  </p>
                  <ul className="mt-1.5 space-y-1.5">
                    <li className="text-[15px] text-gray-600 dark:text-gray-400 flex items-center gap-2.5">
                      <span>📏</span> {t('expedier.departureStep.airTransportWarning.exactDimensions')}
                    </li>
                    <li className="text-[15px] text-gray-600 dark:text-gray-400 flex items-center gap-2.5">
                      <span>📦</span> {t('expedier.departureStep.airTransportWarning.transparentPackaging')}
                    </li>
                    <li className="text-[15px] text-gray-600 dark:text-gray-400 flex items-center gap-2.5">
                      <span>⚖️</span> {t('expedier.departureStep.airTransportWarning.weightLimit')}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <div className="relative overflow-hidden rounded-xl border border-teal-200/50 dark:border-teal-500/20 bg-white dark:bg-gray-900">
            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-teal-500 to-teal-400" />
            <div className="p-5 pl-7">
              <div className="flex items-start gap-3.5">
                <div className="flex-shrink-0">
                  <div className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/30">
                    <PackageIcon className="h-4.5 w-4.5 text-teal-600 dark:text-teal-400" />
                  </div>
                </div>
                <div>
                  <p className="text-[15px] text-gray-900 dark:text-gray-100">
                    <span className="font-medium">{t('expedier.departureStep.increaseChances.title')}</span>
                  </p>
                  <ul className="mt-1.5 space-y-1.5">
                    <li className="text-[15px] text-gray-600 dark:text-gray-400 flex items-center gap-2.5">
                      <span>📸</span> {t('expedier.departureStep.increaseChances.photos')}
                    </li>
                    <li className="text-[15px] text-gray-600 dark:text-gray-400 flex items-center gap-2.5">
                      <span>📏</span> {t('expedier.departureStep.increaseChances.exactDimensions')}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-5">
        <AnimatePresence>
          {fields.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8 text-base text-gray-500 dark:text-gray-400 bg-gradient-to-r from-gray-50/80 via-white/60 to-gray-100/80 dark:from-gray-900/60 dark:via-gray-800/60 dark:to-gray-900/60 rounded-2xl border-2 border-dashed border-primary-200/60 dark:border-primary-700/40 shadow-sm">
              {t('expedier.departureStep.packages.noPackagesAdded')}
            </motion.div>
          )}
          {fields.map((field, idx) => {
            const isOpen = expanded === idx;
            const pkg = watch(`packages.${idx}`);
            const size = SIZE_DIMENSIONS[pkg?.sizeId ?? 1] || selectedSizes[idx] || sizes.find((s: any) => s.id === pkg?.sizeId) || SIZE_DIMENSIONS[1];
            const pkgErrors = errors?.packages?.[idx] as any;
            const dimErrors = dimensionErrors[idx] || {};
            
            return (
                <motion.div
                key={field.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className={cn(
                  'group relative rounded-2xl border bg-white dark:bg-gray-900 transition-all duration-300 overflow-hidden',
                  isOpen
                    ? 'shadow-xl border-primary-200/50 dark:border-primary-500/20 ring-2 ring-primary-200/50 dark:ring-primary-500/20'
                    : 'border-gray-200 dark:border-gray-800 hover:shadow-lg hover:border-primary-300/60 dark:hover:border-primary-700/40',
                  'hover:scale-[1.01]',
                  pkgErrors?.title ? 'border-red-500 dark:border-red-500/60' : ''
                )}
                data-package-index={idx}
                data-accordion-item={true}
              >
                {/* Card header */}
                <div
                  className={cn(
                    'flex items-center justify-between px-5 py-4 cursor-pointer transition-colors duration-300',
                    isOpen ? 'bg-gradient-to-r from-primary-50/60 to-primary-100/40 dark:from-primary-900/10 dark:to-primary-900/5' : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/50',
                    pkgErrors?.title ? 'bg-red-50/60 dark:bg-red-900/10' : ''
                  )}
                  onClick={() => toggleExpand(idx)}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={cn(
                      "flex items-center justify-center rounded-xl p-2.5 transition-colors duration-300",
                      isOpen ? "bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 group-hover:text-primary-600 dark:group-hover:text-primary-400"
                    )}>
                      <PackageIcon className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className={cn(
                        "text-base font-bold truncate max-w-[180px] md:max-w-[320px] transition-colors duration-300",
                        pkgErrors?.title ? "text-red-600 dark:text-red-400" : isOpen ? "text-primary-900 dark:text-primary-100" : "text-gray-900 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-300"
                      )}>
                        {pkg?.title || t('expedier.departureStep.packages.modal.packageTitle')}
                        {pkgErrors?.title && <span className="ml-1 text-red-500">*</span>}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[220px] md:max-w-[400px] font-medium mt-0.5">
                        {pkg?.content ? pkg.content.slice(0, 60) : t('expedier.departureStep.packages.modal.descriptionPlaceholder')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 sm:h-9 sm:w-9 touch-manipulation text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-full transition-colors"
                      onClick={e => {
                        e.stopPropagation();
                        handleRemove(idx);
                      }}
                      disabled={fields.length === 1}
                      aria-label={t('expedier.departureStep.packages.modal.delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300",
                      isOpen ? "bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                    )}>
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                </div>
                {/* Card content */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 pt-0 grid gap-6 md:gap-8">
                        {/* ── Package Info Card: Title + Description ── */}
                        <div className={cn(
                          "rounded-2xl border overflow-hidden shadow-sm transition-all duration-300",
                          (pkgErrors?.title || pkgErrors?.content)
                            ? "border-rose-300 dark:border-rose-700/60 shadow-rose-100 dark:shadow-rose-900/20"
                            : "border-gray-200 dark:border-gray-700/80"
                        )}>
                          {/* Card header */}
                          <div className={cn(
                            "flex items-center justify-between px-5 py-3.5 border-b",
                            (pkgErrors?.title || pkgErrors?.content)
                              ? "bg-rose-50/60 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800/40"
                              : "bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/60 dark:to-gray-800/30 border-gray-100 dark:border-gray-700/60"
                          )}>
                            <div className="flex items-center gap-2.5">
                              <div className={cn(
                                "p-1.5 rounded-lg",
                                (pkgErrors?.title || pkgErrors?.content)
                                  ? "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
                                  : "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                              )}>
                                <PackageIcon className="h-4 w-4" />
                              </div>
                              <span className={cn(
                                "text-sm font-semibold",
                                (pkgErrors?.title || pkgErrors?.content)
                                  ? "text-rose-700 dark:text-rose-300"
                                  : "text-gray-800 dark:text-gray-200"
                              )}>
                                {t('expedier.departureStep.packages.modal.packageInfo', 'Informations du colis')}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {/* Language Toggle for the card */}
                              <LanguageToggle
                                activeLanguage={packageLanguages[idx] || (['fr', 'en', 'ar'].includes(i18n.language) ? i18n.language as TranslatableLanguage : 'fr')}
                                onLanguageChange={(lang) => {
                                  void handlePackageLanguageChange(idx, lang);
                                }}
                                completionStatus={{
                                  fr: !!pkg?.title && !!pkg?.content,
                                  en: !!pkg?.titleEn && !!pkg?.contentEn,
                                  ar: !!pkg?.titleAr && !!pkg?.contentAr,
                                }}
                                errorStatus={{
                                  fr: !!(pkgErrors?.title || pkgErrors?.content),
                                  en: false, 
                                  ar: false,
                                }}
                                defaultLanguage={['fr', 'en', 'ar'].includes(i18n.language) ? i18n.language as TranslatableLanguage : 'fr'}
                                layoutId={`pkg-lang-${field.id}`}
                              />
                            </div>
                          </div>

                          {/* Card body: title + description stacked for full width */}
                          <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-700/60 bg-white dark:bg-gray-900">
                            {/* Title field */}
                            <div className="p-5">
                              <div className="flex items-center gap-2 mb-3">
                                <span className="w-0.5 h-5 rounded-full bg-primary-400 dark:bg-primary-500 flex-shrink-0" />
                                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                  {t('expedier.departureStep.packages.modal.titleSection', 'Titre')}
                                </span>
                              </div>
                              <TranslatableInput
                                label={t('expedier.departureStep.packages.modal.packageTitle')}
                                required
                                as="input"
                                defaultLanguage="fr"
                                id={`pkg-title-${field.id}`}
                                // Controlled mode: master toggle forces language, but we allow user to override temporarily if they click inside (optional, but requested "less clutter", so hide toggle)
                                forcedLanguage={packageLanguages[idx] || (['fr', 'en', 'ar'].includes(i18n.language) ? i18n.language as TranslatableLanguage : 'fr')}
                                onLanguageChangeRequest={(lang) => {
                                  void handlePackageLanguageChange(idx, lang);
                                }}
                                hideLanguageToggle={true}
                                values={{
                                  fr: pkg?.title || '',
                                  en: pkg?.titleEn || '',
                                  ar: pkg?.titleAr || '',
                                }}
                                onChange={(lang: TranslatableLanguage, value: string) => {
                                  if (lang === 'fr') {
                                    setValue(`packages.${idx}.title`, value);
                                    if (value.trim() !== '') clearErrors(`packages.${idx}.title`);
                                    if (idx === 0) setValue('title', value);
                                  } else if (lang === 'en') {
                                    setValue(`packages.${idx}.titleEn`, value);
                                    if (idx === 0) setValue('titleEn', value);
                                  } else if (lang === 'ar') {
                                    setValue(`packages.${idx}.titleAr`, value);
                                    if (idx === 0) setValue('titleAr', value);
                                  }
                                }}
                                placeholder={{
                                  fr: t('expedier.departureStep.packages.modal.packageTitlePlaceholder'),
                                  en: t('expedier.departureStep.packages.modal.packageTitlePlaceholderEn', 'e.g. Important documents, Electronics...'),
                                  ar: t('expedier.departureStep.packages.modal.packageTitlePlaceholderAr', 'مثال: وثائق مهمة، إلكترونيات...'),
                                }}
                                errors={{
                                  fr: pkgErrors?.title?.message as string | undefined,
                                  en: (pkgErrors as any)?.titleEn?.message as string | undefined,
                                  ar: (pkgErrors as any)?.titleAr?.message as string | undefined,
                                }}
                                inputClassName="h-11 text-base"
                                autocompleteSuggestions={PACKAGE_TITLE_SUGGESTIONS}
                                autocompleteMaxItems={10}
                              />
                              {/* Hidden register for react-hook-form validation */}
                              <input type="hidden" {...register(`packages.${idx}.title`, { 
                                required: t('expedier.departureStep.packages.modal.error'),
                                validate: (value: string) => value?.trim() !== '' || t('expedier.departureStep.packages.modal.error'),
                              })} />
                              <input type="hidden" {...register(`packages.${idx}.titleEn` as const, {
                                required: t('expedier.departureStep.packages.modal.error'),
                                validate: (value?: string) => value?.trim() !== '' || t('expedier.departureStep.packages.modal.error'),
                              })} />
                              <input type="hidden" {...register(`packages.${idx}.titleAr` as const, {
                                required: t('expedier.departureStep.packages.modal.error'),
                                validate: (value?: string) => value?.trim() !== '' || t('expedier.departureStep.packages.modal.error'),
                              })} />
                            </div>

                            {/* Description field */}
                            <div className="p-5">
                              <div className="flex items-center gap-2 mb-3">
                                <span className="w-0.5 h-5 rounded-full bg-indigo-400 dark:bg-indigo-500 flex-shrink-0" />
                                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                  {t('expedier.departureStep.packages.modal.descriptionSection', 'Description')}
                                </span>
                              </div>
                              <TranslatableInput
                                label={t('expedier.departureStep.packages.modal.description')}
                                required
                                as="textarea"
                                rows={3}
                                defaultLanguage="fr"
                                id={`pkg-desc-${field.id}`}
                                // Controlled mode
                                forcedLanguage={packageLanguages[idx] || (['fr', 'en', 'ar'].includes(i18n.language) ? i18n.language as TranslatableLanguage : 'fr')}
                                onLanguageChangeRequest={(lang) => {
                                  void handlePackageLanguageChange(idx, lang);
                                }}
                                hideLanguageToggle={true}
                                values={{
                                  fr: pkg?.content || '',
                                  en: pkg?.contentEn || '',
                                  ar: pkg?.contentAr || '',
                                }}
                                onChange={(lang: TranslatableLanguage, value: string) => {
                                  if (lang === 'fr') {
                                    setValue(`packages.${idx}.content`, value);
                                  } else if (lang === 'en') {
                                    setValue(`packages.${idx}.contentEn`, value);
                                  } else if (lang === 'ar') {
                                    setValue(`packages.${idx}.contentAr`, value);
                                  }
                                }}
                                placeholder={{
                                  fr: t('expedier.departureStep.packages.modal.descriptionPlaceholder'),
                                  en: t('expedier.departureStep.packages.modal.descriptionPlaceholderEn', 'Describe the package contents...'),
                                  ar: t('expedier.departureStep.packages.modal.descriptionPlaceholderAr', 'صف محتويات الطرد...'),
                                }}
                                errors={{
                                  fr: pkgErrors?.content?.message as string | undefined,
                                  en: (pkgErrors as any)?.contentEn?.message as string | undefined,
                                  ar: (pkgErrors as any)?.contentAr?.message as string | undefined,
                                }}
                              />
                              {/* Hidden register for react-hook-form validation */}
                              <input type="hidden" {...register(`packages.${idx}.content`, { required: t('expedier.departureStep.packages.modal.error') })} />
                              <input type="hidden" {...register(`packages.${idx}.contentEn` as const, {
                                required: t('expedier.departureStep.packages.modal.error'),
                                validate: (value?: string) => value?.trim() !== '' || t('expedier.departureStep.packages.modal.error'),
                              })} />
                              <input type="hidden" {...register(`packages.${idx}.contentAr` as const, {
                                required: t('expedier.departureStep.packages.modal.error'),
                                validate: (value?: string) => value?.trim() !== '' || t('expedier.departureStep.packages.modal.error'),
                              })} />
                            </div>
                          </div>
                        </div>
                        {/* ────── Dimensions Section: Two Modes ────── */}
                        <div className="space-y-5">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                              {t('expedier.departureStep.packages.modal.size')}
                            </Label>
                          </div>

                          {/* Mode toggle pill */}
                          <div className="flex p-1 bg-gray-100/80 dark:bg-gray-800/80 rounded-xl w-fit border border-gray-200/50 dark:border-gray-700/50 shadow-inner">
                            <button
                              type="button"
                              onClick={() => {
                                setDimensionModes(prev => ({ ...prev, [idx]: 'predefined' }));
                                // When switching back to predefined, re-apply the current size
                                const currentSizeId = pkg?.sizeId || 1;
                                handleSizeSelect(idx, String(currentSizeId));
                              }}
                              className={cn(
                                "flex items-center justify-center gap-2 px-4 py-2 min-h-[44px] touch-manipulation rounded-lg text-sm font-medium transition-all duration-300 ease-out",
                                (dimensionModes[idx] || 'predefined') === 'predefined'
                                  ? "bg-white dark:bg-gray-700 text-primary-700 dark:text-primary-300 shadow-sm ring-1 ring-gray-200/50 dark:ring-gray-600/50"
                                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
                              )}
                            >
                              <Grid3X3 className={cn("h-4 w-4", (dimensionModes[idx] || 'predefined') === 'predefined' ? "text-primary-600 dark:text-primary-400" : "")} />
                              {t('expedier.departureStep.packages.modal.dimensions.predefinedMode', 'Tailles prédéfinies')}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDimensionModes(prev => ({ ...prev, [idx]: 'custom' }));
                                // Clear size-based errors when switching to custom
                                setDimensionErrors(prev => ({
                                  ...prev,
                                  [idx]: { length: false, width: false, height: false }
                                }));
                                clearErrors(`packages.${idx}.dimensions.length`);
                                clearErrors(`packages.${idx}.dimensions.width`);
                                clearErrors(`packages.${idx}.dimensions.height`);
                              }}
                              className={cn(
                                "flex items-center justify-center gap-2 px-4 py-2 min-h-[44px] touch-manipulation rounded-lg text-sm font-medium transition-all duration-300 ease-out",
                                (dimensionModes[idx] || 'predefined') === 'custom'
                                  ? "bg-white dark:bg-gray-700 text-primary-700 dark:text-primary-300 shadow-sm ring-1 ring-gray-200/50 dark:ring-gray-600/50"
                                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
                              )}
                            >
                              <Ruler className={cn("h-4 w-4", (dimensionModes[idx] || 'predefined') === 'custom' ? "text-primary-600 dark:text-primary-400" : "")} />
                              {t('expedier.departureStep.packages.modal.dimensions.customMode', 'Saisie personnalisée')}
                            </button>
                          </div>

                          {/* ── Predefined Sizes Mode ── */}
                          {(dimensionModes[idx] || 'predefined') === 'predefined' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {Object.entries(SIZE_DIMENSIONS).map(([id, dim]) => {
                                  const sizeId = Number(id);
                                  const isAllowed = allowedSizeIds.includes(sizeId);
                                  const isSelected = (pkg?.sizeId || 1) === sizeId;
                                  const example = PREDEFINED_SIZE_EXAMPLES[sizeId];
                                  const exampleText = i18n.language === 'ar' ? example.examplesAr : i18n.language === 'en' ? example.examplesEn : example.examplesFr;
                                  return (
                                    <button
                                      key={id}
                                      type="button"
                                      disabled={!isAllowed}
                                      onClick={() => handleSizeSelect(idx, id)}
                                      className={cn(
                                        "relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300 text-center group overflow-hidden",
                                        isSelected
                                          ? "border-primary-500 dark:border-primary-400 bg-primary-50/80 dark:bg-primary-900/30 shadow-md scale-[1.02]"
                                          : "border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-primary-200 dark:hover:border-primary-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:shadow-sm",
                                        !isAllowed && "opacity-40 cursor-not-allowed grayscale-[0.5]"
                                      )}
                                    >
                                      {isSelected && (
                                        <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full bg-primary-500 dark:bg-primary-400 shadow-md ring-2 ring-white dark:ring-gray-900">
                                          <Check className="h-3 w-3 text-white" strokeWidth={3} />
                                        </div>
                                      )}
                                      <div className={cn(
                                        "p-3 rounded-full transition-colors duration-300",
                                        isSelected ? "bg-primary-100 dark:bg-primary-800/50" : "bg-gray-100 dark:bg-gray-800 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20"
                                      )}>
                                        <example.icon className={cn(
                                          "h-7 w-7 transition-colors duration-300",
                                          isSelected ? "text-primary-600 dark:text-primary-400" : "text-gray-500 dark:text-gray-400 group-hover:text-primary-500 dark:group-hover:text-primary-400"
                                        )} strokeWidth={1.5} />
                                      </div>
                                      <div className="flex flex-col items-center w-full">
                                        <span className={cn(
                                          "text-base font-bold tracking-tight",
                                          isSelected ? "text-primary-700 dark:text-primary-300" : "text-gray-900 dark:text-gray-100"
                                        )}>
                                          {dim.name}
                                        </span>
                                        <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-0.5 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md w-full truncate">
                                          {dim.maxLength}×{dim.maxWidth}×{dim.maxHeight} cm
                                        </span>
                                      </div>
                                      <span className={cn(
                                        "text-[11px] leading-snug line-clamp-3 mt-1 w-full text-center",
                                        isSelected ? "text-primary-600/80 dark:text-primary-400/80" : "text-gray-400 dark:text-gray-500"
                                      )}>
                                        {exampleText}
                                      </span>
                                      {!isAllowed && (
                                        <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                                          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm transform -rotate-12">
                                            {t('expedier.departureStep.packages.modal.dimensions.tooLargeForVehicle')}
                                          </span>
                                        </div>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                              
                              {/* Show selected size summary */}
                              <div className={cn(
                                "flex items-center gap-4 p-4 rounded-xl border transition-all duration-300",
                                PREDEFINED_SIZE_EXAMPLES[pkg?.sizeId || 1]?.bgColor || 'bg-gray-50',
                                PREDEFINED_SIZE_EXAMPLES[pkg?.sizeId || 1]?.borderColor || 'border-gray-200'
                              )}>
                                <div className={cn(
                                  "p-2.5 rounded-lg bg-white/60 dark:bg-black/20 shadow-sm",
                                  PREDEFINED_SIZE_EXAMPLES[pkg?.sizeId || 1]?.color || 'text-gray-600'
                                )}>
                                  {(() => {
                                    const SelectedIcon = PREDEFINED_SIZE_EXAMPLES[pkg?.sizeId || 1]?.icon || PackageIcon;
                                    return <SelectedIcon className="h-6 w-6" strokeWidth={1.5} />;
                                  })()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className={cn("text-sm font-bold", PREDEFINED_SIZE_EXAMPLES[pkg?.sizeId || 1]?.color || 'text-gray-700')}>
                                      {t('expedier.departureStep.packages.modal.dimensions.selectedSize', 'Taille sélectionnée')} : {size?.name || 'S'}
                                    </p>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/60 dark:bg-black/20 text-gray-700 dark:text-gray-300 shadow-sm">
                                      ~{(((size?.maxLength || 40) * (size?.maxWidth || 30) * (size?.maxHeight || 20)) / 1000).toFixed(1)} L
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">
                                    {size?.maxLength || 40} <span className="text-gray-400">×</span> {size?.maxWidth || 30} <span className="text-gray-400">×</span> {size?.maxHeight || 20} cm
                                  </p>
                                </div>
                              </div>

                              {/* Hidden inputs to keep dimensions in form state for predefined mode */}
                              <input type="hidden" {...register(`packages.${idx}.dimensions.length`)} />
                              <input type="hidden" {...register(`packages.${idx}.dimensions.width`)} />
                              <input type="hidden" {...register(`packages.${idx}.dimensions.height`)} />
                            </div>
                          )}

                          {/* ── Custom Dimensions Mode ── */}
                          {(dimensionModes[idx] || 'predefined') === 'custom' && (
                            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/30 rounded-xl flex items-start gap-3 shadow-sm">
                                <div className="p-2 bg-white dark:bg-blue-800/50 rounded-lg shadow-sm">
                                  <Ruler className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <p className="font-semibold text-blue-900 dark:text-blue-300 text-sm">
                                    {t('expedier.departureStep.packages.modal.dimensions.customInfo', 'Saisissez les dimensions exactes de votre colis')}
                                  </p>
                                  <p className="mt-1 text-sm text-blue-700/80 dark:text-blue-400/80">
                                    {t('expedier.departureStep.packages.modal.dimensions.customHint', 'Mesurez longueur, largeur et hauteur en centimètres pour un calcul précis du volume.')}
                                  </p>
                                </div>
                              </div>

                              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                                <div className="grid grid-cols-3 gap-3 sm:gap-5">
                                  {[
                                    { id: 'length', icon: MoveHorizontal, label: t('expedier.departureStep.packages.modal.dimensions.length') },
                                    { id: 'width', icon: MoveDiagonal, label: t('expedier.departureStep.packages.modal.dimensions.width') },
                                    { id: 'height', icon: MoveVertical, label: t('expedier.departureStep.packages.modal.dimensions.height') }
                                  ].map((dim) => {
                                    const dimId = dim.id as 'length' | 'width' | 'height';
                                    const hasError = dimErrors[dimId];
                                    const maxVal = getCustomMaxDimension(dimId);
                                    const val = pkg?.dimensions?.[dimId];
                                    const isValid = val > 0 && !hasError;
                                    
                                    return (
                                      <div key={dimId} className="relative group">
                                        <Label className={cn(
                                          "text-xs font-semibold mb-2 flex flex-col gap-1 transition-colors",
                                          hasError ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300 group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400'
                                        )}>
                                          <span className="flex items-center gap-1">
                                            <dim.icon className="h-3.5 w-3.5 text-gray-400 group-focus-within:text-primary-500 transition-colors shrink-0" />
                                            <span className="truncate">{dim.label}</span>
                                          </span>
                                          <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded self-start">
                                            Max {maxVal}
                                          </span>
                                        </Label>
                                        <div className="relative flex items-center">
                                          <Input
                                            type="number"
                                            {...register(`packages.${idx}.dimensions.${dimId}`, {
                                              required: t('expedier.departureStep.packages.modal.dimensions.greaterThanZero'),
                                              valueAsNumber: true,
                                              validate: value => {
                                                if (value <= 0) return t('expedier.departureStep.packages.modal.dimensions.greaterThanZero');
                                                return value <= maxVal || 
                                                  t('expedier.departureStep.packages.modal.dimensions.maxError', {
                                                    dimension: dim.label,
                                                    max: maxVal
                                                  });
                                              },
                                              onChange: (e) => handleDimensionChange(idx, dimId, Number(e.target.value))
                                            })}
                                            max={maxVal}
                                            min={1}
                                            placeholder="0"
                                            className={cn(
                                              "h-12 text-lg font-medium rounded-xl pl-4 pr-12 transition-all duration-200",
                                              hasError 
                                                ? 'border-red-300 bg-red-50/50 text-red-900 focus:border-red-500 focus:ring-red-500/20 dark:border-red-800/50 dark:bg-red-900/10 dark:text-red-100' 
                                                : 'border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary-500 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800/50 dark:focus:bg-gray-900'
                                            )}
                                          />
                                          <div className="absolute right-0 inset-y-0 flex items-center pr-3 pointer-events-none">
                                            <span className={cn(
                                              "text-sm font-semibold",
                                              hasError ? "text-red-400" : "text-gray-400"
                                            )}>cm</span>
                                          </div>
                                          
                                          {/* Status indicator */}
                                          <div className="absolute -right-2 -top-2">
                                            {hasError ? (
                                              <div className="bg-white dark:bg-gray-900 rounded-full p-0.5 shadow-sm">
                                                <XCircle className="h-4 w-4 text-red-500" />
                                              </div>
                                            ) : isValid ? (
                                              <div className="bg-white dark:bg-gray-900 rounded-full p-0.5 shadow-sm">
                                                <Check className="h-4 w-4 text-green-500" />
                                              </div>
                                            ) : null}
                                          </div>
                                        </div>
                                        {pkgErrors?.dimensions?.[dimId] && (
                                          <p className="absolute -bottom-5 left-0 text-[11px] font-medium text-red-500 dark:text-red-400 truncate w-full" key={`${dimId}-err-${idx}-${i18n.language}`}>
                                            {pkgErrors.dimensions[dimId].message}
                                          </p>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                                
                                {/* Dimension warning indicator */}
                                {(dimErrors.length || dimErrors.width || dimErrors.height) && (
                                  <div className="mt-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl animate-in fade-in slide-in-from-top-2" key={`dim-error-${idx}-${i18n.language}`}>
                                    <div className="flex items-start gap-3">
                                      <div className="p-1.5 bg-red-100 dark:bg-red-800/50 rounded-lg">
                                        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                      </div>
                                      <div className="text-sm text-red-700 dark:text-red-300 pt-0.5">
                                        <p className="font-medium">
                                          {(() => {
                                            const lengthValue = getValues(`packages.${idx}.dimensions.length`) || 0;
                                            const widthValue = getValues(`packages.${idx}.dimensions.width`) || 0;
                                            const heightValue = getValues(`packages.${idx}.dimensions.height`) || 0;
                                            
                                            if (dimErrors.length && lengthValue <= 0) return t('expedier.departureStep.packages.modal.dimensions.greaterThanZero');
                                            if (dimErrors.width && widthValue <= 0) return t('expedier.departureStep.packages.modal.dimensions.greaterThanZero');
                                            if (dimErrors.height && heightValue <= 0) return t('expedier.departureStep.packages.modal.dimensions.greaterThanZero');
                                            
                                            if (dimErrors.length) return t('expedier.departureStep.packages.modal.dimensions.maxError', { dimension: t('expedier.departureStep.packages.modal.dimensions.length'), max: getCustomMaxDimension('length') });
                                            if (dimErrors.width) return t('expedier.departureStep.packages.modal.dimensions.maxError', { dimension: t('expedier.departureStep.packages.modal.dimensions.width'), max: getCustomMaxDimension('width') });
                                            if (dimErrors.height) return t('expedier.departureStep.packages.modal.dimensions.maxError', { dimension: t('expedier.departureStep.packages.modal.dimensions.height'), max: getCustomMaxDimension('height') });
                                            
                                            return '';
                                          })()}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Volume preview for custom dimensions */}
                                {pkg?.dimensions?.length > 0 && pkg?.dimensions?.width > 0 && pkg?.dimensions?.height > 0 && !dimErrors.length && !dimErrors.width && !dimErrors.height && (
                                  <div className="mt-6 flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50 animate-in fade-in">
                                    <div className="flex items-center gap-3">
                                      <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                                        <Box className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                      </div>
                                      <div>
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Volume estimé</p>
                                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-0.5">
                                          {pkg.dimensions.length} × {pkg.dimensions.width} × {pkg.dimensions.height} cm
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                        {((pkg.dimensions.length * pkg.dimensions.width * pkg.dimensions.height) / 1000).toFixed(1)}
                                      </span>
                                      <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 ml-1">L</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                          <Label className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                            <Scale className="h-4 w-4 text-primary-500" />
                            {t('expedier.departureStep.packages.modal.weight.title')}
                          </Label>
                          <div className="mb-3">
                            <div className="flex items-center justify-between gap-3 mb-2">
                              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                              {t('expedier.departureStep.packages.modal.weight.quickSelect', 'Selection rapide')}
                              </p>
                            </div>
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                              {getPredefinedWeightOptions().map((option) => {
                                const selectedWeight = Number(pkg?.weight || 0);
                                const isSelected = Math.abs(selectedWeight - option) < 0.001;
                                const maxForCurrentPackage = getMaxWeight(idx);
                                const isAvailable = option <= Math.max(maxForCurrentPackage, 0);

                                return (
                                  <button
                                    key={`weight-option-${idx}-${option}`}
                                    type="button"
                                    onClick={() => handlePredefinedWeightSelect(idx, option)}
                                    disabled={!isAvailable}
                                    className={cn(
                                      'relative rounded-xl border px-2.5 py-2 text-sm font-semibold transition-all duration-200',
                                      'backdrop-blur-sm',
                                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400',
                                      isSelected
                                        ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-primary-100 text-primary-700 dark:border-primary-400 dark:from-primary-900/50 dark:to-primary-900/20 dark:text-primary-200 shadow-md'
                                        : isAvailable
                                          ? 'border-gray-200 bg-white/90 text-gray-700 hover:border-primary-300 hover:bg-gradient-to-br hover:from-primary-50/80 hover:to-white dark:border-gray-700 dark:bg-gray-800/90 dark:text-gray-200 dark:hover:border-primary-700 dark:hover:from-primary-900/20 dark:hover:to-gray-800'
                                          : 'border-gray-200 bg-gray-100/70 text-gray-400 cursor-not-allowed dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-500'
                                    )}
                                    aria-pressed={isSelected}
                                    title={!isAvailable ? t('expedier.departureStep.packages.modal.weight.unavailableForCapacity', 'Indisponible selon la capacité restante') : undefined}
                                  >
                                    {option} kg
                                  </button>
                                );
                              })}

                              <button
                                type="button"
                                onClick={() => {
                                  const input = weightInputRefs.current[idx];
                                  if (input) {
                                    input.focus();
                                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  }
                                }}
                                className="rounded-xl border border-dashed border-primary-300 bg-primary-50/70 px-2.5 py-2 text-sm font-semibold text-primary-700 transition-all duration-200 hover:bg-primary-100 dark:border-primary-700 dark:bg-primary-900/20 dark:text-primary-300 dark:hover:bg-primary-900/35"
                              >
                                {t('expedier.departureStep.packages.modal.weight.more', 'Plus')}
                              </button>
                            </div>
                          </div>
                          <WeightInput
                            value={pkg?.weight || 0}
                            onChange={val => {
                              setValue(`packages.${idx}.weight`, val);
                              // Validation: weight must be > 0
                              if (val <= 0) {
                                setError(`packages.${idx}.weight`, {
                                  type: 'min',
                                  message: t('expedier.departureStep.packages.modal.weight.greaterThanZero', 'Le poids doit être supérieur à 0')
                                });
                              } else {
                                clearErrors(`packages.${idx}.weight`);
                              }
                            }}
                            minWeight={0}
                            maxWeight={getMaxWeight(idx)}
                            className="rounded-xl border-gray-200 dark:border-gray-700 focus:ring-primary-500 dark:focus:ring-primary-600 h-12 text-lg"
                            inputRef={el => weightInputRefs.current[idx] = el}
                          />
                          {/* Error message for weight <= 0 */}
                          {errors?.packages?.[idx]?.weight?.message && (
                            <p className="text-xs font-medium text-red-500 mt-2 flex items-center gap-1.5">
                              <AlertCircle className="h-3.5 w-3.5" />
                              {errors?.packages?.[idx]?.weight?.message}
                            </p>
                          )}
                          {/* Weight indicator and info */}
                          <div className="mt-4 text-sm">
                            {(() => {
                              // Calculate total and available weight
                              const pkgs = getValues('packages') || [];
                              const totalWeight = pkgs.reduce((total, p, i) => i === idx ? total : total + ((p.weight || 0) * (p.quantity || 1)), 0) + ((pkg?.weight || 0) * (pkg?.quantity || 1));
                              let maxWeight = 100;
                              if (selectedShipmentType === 1) maxWeight = 32;
                              else if (selectedShipmentType === 2) maxWeight = TERRESTRIAL_LIMITS[selectedVehicleType] || 0;
                              
                              // Calculate the weight of current package
                              const currentPackageWeight = (pkg?.weight || 0) * (pkg?.quantity || 1);
                              
                              // Calculate weight without current package
                              const weightWithoutCurrent = totalWeight - currentPackageWeight;
                              
                              // Calculate remaining weight
                              const remainingWeight = Math.max(0, maxWeight - weightWithoutCurrent);
                              
                              const isOverLimit = totalWeight > maxWeight && maxWeight > 0;
                              const percentage = Math.min(100, (totalWeight / maxWeight) * 100);
                              
                              return (
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-500 dark:text-gray-400 font-medium">{t("expedier.departureStep.packages.modal.weight.currentWeight")}</span>
                                    <span className={cn("font-bold", isOverLimit ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100')}>{totalWeight.toFixed(2)} kg</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-500 dark:text-gray-400 font-medium">{t("expedier.departureStep.packages.modal.weight.availableWeight")}</span>
                                    <span className={cn("font-bold", isOverLimit ? 'text-red-600 dark:text-red-400' : 'text-primary-600 dark:text-primary-400')}>
                                      {isOverLimit ? t("expedier.departureStep.packages.modal.weight.exceeded") : `${(maxWeight - totalWeight).toFixed(2)} kg`}
                                    </span>
                                  </div>
                                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
                                    <div
                                      className={cn("h-full rounded-full transition-all duration-500 ease-out", isOverLimit ? 'bg-red-500' : percentage > 85 ? 'bg-amber-500' : 'bg-primary-500')}
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                  <div className="flex items-start gap-2 pt-1 text-xs text-blue-600/80 dark:text-blue-400/80">
                                    <InfoIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                    <p className="leading-relaxed">{t("expedier.departureStep.packages.modal.weight.info")}</p>
                                  </div>
                                  {isOverLimit && (
                                    <div className="p-2.5 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800/30">
                                      <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-2 font-medium">
                                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                        <span>{t("expedier.departureStep.packages.modal.weight.airWarning")}</span>
                                      </p>
                                    </div>
                                  )}
                                  {/* Display custom weight error for air transport */}
                                  {watch(`packages.${idx}.weightError`) && (
                                    <div className="p-2.5 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800/30">
                                      <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-2 font-medium">
                                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                        <span>{watch(`packages.${idx}.weightError`)}</span>
                                      </p>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                        {/* Per-package volume info */}
                        {(selectedShipmentType === 1 || (selectedShipmentType === 2 && selectedVehicleType)) && (
                          <div className="p-4 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-100/80 dark:border-blue-800/30 rounded-2xl shadow-sm">
                            {(() => {
                              const vehicleId = selectedShipmentType === 1 ? 6 : Number(selectedVehicleType);
                              const maxVolume = VEHICLE_VOLUME_LIMITS[vehicleId];
                              if (!maxVolume) return null;
                              const allPkgs = getValues('packages') || [];
                              const totalVolume = calculateTotalPackagesVolume(allPkgs);
                              const pkgVolume = ((pkg?.dimensions?.length || 0) * (pkg?.dimensions?.width || 0) * (pkg?.dimensions?.height || 0)) * (pkg?.quantity || 1);
                              const totalL = cm3ToLitres(totalVolume);
                              const maxL = cm3ToLitres(maxVolume);
                              const unitL = cm3ToLitres(pkgVolume);
                              const percentage = Math.min(100, (totalVolume / maxVolume) * 100);
                              const isOverLimit = totalVolume > maxVolume;

                              // Check if this specific package exceeds vehicle axis limits
                              const vehicleDims = VEHICLE_DIMENSION_LIMITS[vehicleId];
                              const axisExceeded = vehicleDims ? {
                                length: (pkg?.dimensions?.length || 0) > vehicleDims.length,
                                width: (pkg?.dimensions?.width || 0) > vehicleDims.width,
                                height: (pkg?.dimensions?.height || 0) > vehicleDims.height,
                              } : null;
                              const hasAxisError = axisExceeded && (axisExceeded.length || axisExceeded.width || axisExceeded.height);

                              return (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2.5 mb-2">
                                    <div className="p-1.5 bg-blue-100 dark:bg-blue-800/50 rounded-lg">
                                      <Box className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <span className="text-sm font-bold text-blue-900 dark:text-blue-300">
                                      {t('expedier.departureStep.packages.modal.dimensions.volumeTitle', 'Volume')}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-blue-700/80 dark:text-blue-400/80 font-medium">{t('expedier.departureStep.packages.modal.dimensions.thisPackageVolume', 'This package:')}</span>
                                    <span className="font-bold text-blue-900 dark:text-blue-200">{unitL} L</span>
                                  </div>
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-blue-700/80 dark:text-blue-400/80 font-medium">{t('expedier.departureStep.packages.modal.dimensions.totalVolume', 'Total volume:')}</span>
                                    <span className={cn("font-bold", isOverLimit ? "text-red-600 dark:text-red-400" : "text-blue-900 dark:text-blue-200")}>
                                      {totalL} L / {maxL} L
                                    </span>
                                  </div>
                                  <div className="h-2 bg-blue-100/50 dark:bg-blue-900/30 rounded-full overflow-hidden shadow-inner mt-1">
                                    <div
                                      className={cn("h-full rounded-full transition-all duration-500 ease-out", isOverLimit ? "bg-red-500" : percentage > 85 ? "bg-amber-500" : "bg-blue-500")}
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  {isOverLimit && (
                                    <div className="mt-3 p-2.5 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800/30">
                                      <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-2 font-medium">
                                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                        <span>{t('expedier.departureStep.packages.volumeLimitExceeded.perPackageWarning', 'Total volume exceeds the vehicle capacity. Remove packages or reduce dimensions.')}</span>
                                      </p>
                                    </div>
                                  )}
                                  {hasAxisError && (
                                    <div className="mt-3 p-2.5 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800/30">
                                      <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-2 font-medium">
                                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                        <span>{t('expedier.departureStep.packages.modal.dimensions.exceedsVehicle', 'This package exceeds the vehicle\'s cargo dimensions ({{length}} × {{width}} × {{height}} cm).', {
                                          length: vehicleDims?.length || 0,
                                          width: vehicleDims?.width || 0,
                                          height: vehicleDims?.height || 0,
                                        })}</span>
                                      </p>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                            <Label className="text-sm font-semibold mb-3 block text-gray-800 dark:text-gray-200">
                              {t('expedier.departureStep.packages.modal.quantity')}
                            </Label>
                            <div className="relative">
                              <Input
                                type="number"
                                min={0}
                                {...register(`packages.${idx}.quantity`, {
                                  required: t('expedier.departureStep.packages.modal.error'),
                                  min: { value: 1, message: t('expedier.departureStep.packages.modal.quantityMinError', { min: 1 }) },
                                  validate: value => Number(value) > 0 || t('expedier.departureStep.packages.modal.quantityMinError', { min: 1 }),
                                  onChange: () => setTimeout(updateTotalValue, 0)
                                })}
                                value={pkg?.quantity ?? ''}
                                onChange={e => {
                                  // Let the user enter 0 or any value, but always pass a number to setValue
                                  const val = e.target.value === '' ? NaN : Number(e.target.value);
                                  setValue(`packages.${idx}.quantity`, val);
                                  setTimeout(updateTotalValue, 0);
                                }}
                                className={cn(
                                  "h-12 text-lg font-medium rounded-xl transition-all duration-200",
                                  errors?.packages?.[idx]?.quantity 
                                    ? "border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-red-500/20 dark:border-red-800/50 dark:bg-red-900/10" 
                                    : "border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary-500 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800/50 dark:focus:bg-gray-900"
                                )}
                                ref={el => quantityInputRefs.current[idx] = el}
                              />
                            </div>
                            {errors?.packages?.[idx]?.quantity && (
                              <p className="text-xs font-medium text-red-500 mt-2 flex items-center gap-1.5">
                                <AlertCircle className="h-3.5 w-3.5" />
                                {errors?.packages?.[idx]?.quantity?.message}
                              </p>
                            )}
                          </div>
                          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                            <Label className="text-sm font-semibold mb-3 block text-gray-800 dark:text-gray-200">
                              {t('expedier.departureStep.packages.modal.value')}
                            </Label>
                            <div className="relative">
                              <Input
                                type="number"
                                min={0}
                                {...register(`packages.${idx}.value`, {
                                  valueAsNumber: true,
                                })}
                                value={pkg?.value == null || String(pkg?.value) === '' ? '' : pkg.value}
                                className={cn(
                                  "h-12 text-lg font-medium rounded-xl pl-4 pr-12 transition-all duration-200",
                                  errors?.packages?.[idx]?.value 
                                    ? "border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-red-500/20 dark:border-red-800/50 dark:bg-red-900/10" 
                                    : "border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary-500 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800/50 dark:focus:bg-gray-900"
                                )}
                                onChange={(e) => {
                                  const inputValue = e.target.value;
                                  if (inputValue === '') {
                                    setValue(`packages.${idx}.value`, '' as any);
                                  } else {
                                    const numValue = Number(inputValue);
                                    setValue(`packages.${idx}.value`, numValue >= 0 ? numValue : 0);
                                  }
                                  setTimeout(updateTotalValue, 0);
                                }}
                                ref={el => valueInputRefs.current[idx] = el}
                              />
                              <div className="absolute right-0 inset-y-0 flex items-center pr-4 pointer-events-none">
                                <span className="text-sm font-bold text-gray-400">€</span>
                              </div>
                            </div>
                            {errors?.packages?.[idx]?.value && (
                              <p className="text-xs font-medium text-red-500 mt-2 flex items-center gap-1.5">
                                <AlertCircle className="h-3.5 w-3.5" />
                                {errors?.packages?.[idx]?.value?.message}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <Label className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                              {t('expedier.departureStep.packages.modal.photos.title')}
                            </Label>
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                              {pkg?.images?.length || 0} {t('expedier.departureStep.packages.modal.photos.count', 'photo(s)')}
                            </span>
                          </div>
                          <div className="space-y-4">
                            {(() => {
                              const hasUploadedPhotos = (pkg?.images?.length || 0) > 0;
                              const hasConsultedGuide = Boolean(photoGuideConsulted[idx]) || hasUploadedPhotos;
                              const isGuideReviewOpen = activePhotoGuideFor === idx;

                              return (
                                <div
                                  ref={el => imageSectionRefs.current[idx] = el}
                                  className="overflow-hidden rounded-3xl border border-gray-200/70 dark:border-gray-700/60 bg-white/75 dark:bg-gray-900/55 shadow-[0_12px_32px_rgba(15,23,42,0.08)] backdrop-blur-sm"
                                >
                                  <AnimatePresence mode="wait" initial={false}>
                                    {!hasConsultedGuide ? (
                                      <motion.div
                                        key={`photo-guide-${idx}-locked`}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        transition={{ duration: 0.22, ease: 'easeOut' }}
                                      >
                                        <div className="p-4 sm:p-5">
                                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                            <PackageIcon className="h-4 w-4 text-primary-600" />
                                            {t('expedier.departureStep.packages.modal.photos.guide.addPhoto', 'Ajouter une photo')}
                                          </p>
                                          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                                            {t('expedier.departureStep.packages.modal.photos.guide.subtitle', 'Choisissez une photo claire de l objet')}
                                          </p>
                                        </div>

                                        <div className="px-4 pb-4 sm:px-5 sm:pb-5 space-y-5">
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                            {photoGuideExamples.map((example) => (
                                              <article
                                                key={example.key}
                                                className={cn(
                                                  'group relative overflow-hidden rounded-2xl border bg-white/90 dark:bg-gray-900/70 shadow-[0_10px_24px_rgba(15,23,42,0.08)]',
                                                  example.tone === 'success'
                                                    ? 'border-emerald-200/70 dark:border-emerald-700/45'
                                                    : 'border-gray-200/80 dark:border-gray-700/60'
                                                )}
                                              >
                                                <div className="relative aspect-[5/4] bg-gray-100 dark:bg-gray-800">
                                                  <Image
                                                    src={example.src}
                                                    alt={example.alt}
                                                    fill
                                                    loading="lazy"
                                                    sizes="(min-width: 1280px) 360px, (min-width: 768px) 42vw, 100vw"
                                                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                                                  />
                                                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
                                                  <span
                                                    className={cn(
                                                      'absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border backdrop-blur-md',
                                                      example.tone === 'success'
                                                        ? 'border-emerald-200/80 bg-emerald-100/90 text-emerald-700 dark:border-emerald-700/60 dark:bg-emerald-900/70 dark:text-emerald-200'
                                                        : 'border-white/70 bg-white/90 text-gray-700 dark:border-gray-700/70 dark:bg-gray-900/75 dark:text-gray-200'
                                                    )}
                                                  >
                                                    {example.tone === 'success' ? (
                                                      <Check className="h-3.5 w-3.5" />
                                                    ) : (
                                                      <XCircle className="h-3.5 w-3.5" />
                                                    )}
                                                    {example.label}
                                                  </span>
                                                </div>
                                              </article>
                                            ))}
                                          </div>

                                          <Accordion
                                            type="single"
                                            collapsible
                                            className="rounded-2xl border border-gray-200/70 dark:border-gray-700/60 bg-white/65 dark:bg-gray-900/45 px-3 sm:px-4"
                                          >
                                            <AccordionItem value={`photo-tips-${idx}`} className="border-none">
                                              <AccordionTrigger className="py-3 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 hover:no-underline">
                                                {t('expedier.departureStep.packages.modal.photos.guide.tipsAccordionLabel', 'Voir les 4 conseils')}
                                              </AccordionTrigger>
                                              <AccordionContent className="pb-3">
                                                <ul className="space-y-2.5">
                                                  {photoGuideTips.map((tip) => (
                                                    <li key={tip.key} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                                                      <Check className="h-3.5 w-3.5 mt-0.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                                                      <span>
                                                        <span className="font-semibold text-gray-900 dark:text-gray-100">{tip.title}:</span>{' '}
                                                        {tip.description}
                                                      </span>
                                                    </li>
                                                  ))}
                                                </ul>
                                              </AccordionContent>
                                            </AccordionItem>
                                          </Accordion>

                                          <Button
                                            type="button"
                                            onClick={() => {
                                              setPhotoGuideConsulted(prev => ({ ...prev, [idx]: true }));
                                              setActivePhotoGuideFor(null);
                                              const section = imageSectionRefs.current[idx];
                                              if (section) {
                                                setTimeout(() => {
                                                  section.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                }, 160);
                                              }
                                            }}
                                            className="w-full rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-600/20"
                                          >
                                            {t('expedier.departureStep.packages.modal.photos.guide.unlockUpload', 'Continuer vers l ajout')}
                                          </Button>
                                        </div>
                                      </motion.div>
                                    ) : (
                                      <motion.div
                                        key={`photo-guide-${idx}-open`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -6 }}
                                        transition={{ duration: 0.24, ease: 'easeOut' }}
                                        className="p-4 sm:p-5 space-y-4"
                                      >
                                        <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200/70 dark:border-emerald-700/45 bg-emerald-50/80 dark:bg-emerald-900/20 px-3.5 py-2.5">
                                          <p className="text-xs sm:text-sm font-medium text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                                            <Check className="h-4 w-4" />
                                            {t('expedier.departureStep.packages.modal.photos.guide.seenRow', 'Conseils photo vus')}
                                          </p>
                                          <button
                                            type="button"
                                            onClick={() => setActivePhotoGuideFor(prev => (prev === idx ? null : idx))}
                                            className="min-h-[44px] px-3 touch-manipulation text-xs font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors rounded-lg"
                                          >
                                            {t('expedier.departureStep.packages.modal.photos.guide.reviewAction', 'Revoir')}
                                          </button>
                                        </div>

                                        <AnimatePresence initial={false}>
                                          {isGuideReviewOpen && (
                                            <motion.div
                                              initial={{ opacity: 0, height: 0 }}
                                              animate={{ opacity: 1, height: 'auto' }}
                                              exit={{ opacity: 0, height: 0 }}
                                              transition={{ duration: 0.2, ease: 'easeOut' }}
                                              className="overflow-hidden"
                                            >
                                              <div className="space-y-4 rounded-2xl border border-gray-200/70 dark:border-gray-700/60 bg-white/70 dark:bg-gray-900/40 p-3.5 sm:p-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                  {photoGuideExamples.map((example) => (
                                                    <article
                                                      key={`review-${example.key}`}
                                                      className={cn(
                                                        'relative overflow-hidden rounded-xl border bg-white/90 dark:bg-gray-900/70',
                                                        example.tone === 'success'
                                                          ? 'border-emerald-200/70 dark:border-emerald-700/45'
                                                          : 'border-gray-200/80 dark:border-gray-700/60'
                                                      )}
                                                    >
                                                      <div className="relative aspect-[5/4] bg-gray-100 dark:bg-gray-800">
                                                        <Image
                                                          src={example.src}
                                                          alt={example.alt}
                                                          fill
                                                          loading="lazy"
                                                          sizes="(min-width: 1280px) 320px, (min-width: 768px) 40vw, 100vw"
                                                          className="object-cover"
                                                        />
                                                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
                                                        <span
                                                          className={cn(
                                                            'absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold border backdrop-blur-md',
                                                            example.tone === 'success'
                                                              ? 'border-emerald-200/80 bg-emerald-100/90 text-emerald-700 dark:border-emerald-700/60 dark:bg-emerald-900/70 dark:text-emerald-200'
                                                              : 'border-white/70 bg-white/90 text-gray-700 dark:border-gray-700/70 dark:bg-gray-900/75 dark:text-gray-200'
                                                          )}
                                                        >
                                                          {example.tone === 'success' ? <Check className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                                          {example.label}
                                                        </span>
                                                      </div>
                                                    </article>
                                                  ))}
                                                </div>

                                                <Accordion
                                                  type="single"
                                                  collapsible
                                                  className="rounded-xl border border-gray-200/70 dark:border-gray-700/60 bg-white/70 dark:bg-gray-900/45 px-3"
                                                >
                                                  <AccordionItem value={`photo-tips-review-${idx}`} className="border-none">
                                                    <AccordionTrigger className="py-2.5 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 hover:no-underline">
                                                      {t('expedier.departureStep.packages.modal.photos.guide.tipsAccordionLabel', 'Voir les 4 conseils')}
                                                    </AccordionTrigger>
                                                    <AccordionContent className="pb-3">
                                                      <ul className="space-y-2.5">
                                                        {photoGuideTips.map((tip) => (
                                                          <li key={`review-tip-${tip.key}`} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                                                            <Check className="h-3.5 w-3.5 mt-0.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                                                            <span>
                                                              <span className="font-semibold text-gray-900 dark:text-gray-100">{tip.title}:</span>{' '}
                                                              {tip.description}
                                                            </span>
                                                          </li>
                                                        ))}
                                                      </ul>
                                                    </AccordionContent>
                                                  </AccordionItem>
                                                </Accordion>
                                              </div>
                                            </motion.div>
                                          )}
                                        </AnimatePresence>

                                        <motion.div
                                          initial={{ opacity: 0, y: 8 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ duration: 0.22, ease: 'easeOut', delay: 0.05 }}
                                        >
                                          <FileUpload
                                            registerName={`packages.${idx}.images`}
                                            multiple={true}
                                            existingImages={pkg?.images || []}
                                            {...register(`packages.${idx}.images`, {
                                              required: t('expedier.departureStep.packages.modal.photos.required'),
                                            })}
                                          />
                                        </motion.div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "p-2 rounded-lg transition-colors duration-300",
                              pkg?.fragile ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" : "bg-white dark:bg-gray-700 text-gray-400"
                            )}>
                              <AlertCircle className="h-5 w-5" />
                            </div>
                            <div>
                              <Label className="text-sm font-semibold text-gray-800 dark:text-gray-200 cursor-pointer" htmlFor={`fragile-${idx}`}>
                                {t('expedier.departureStep.packages.modal.fragile')}
                              </Label>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {t('expedier.departureStep.packages.modal.fragileDesc', 'Cochez si le contenu est fragile')}
                              </p>
                            </div>
                          </div>
                          <Switch
                            id={`fragile-${idx}`}
                            {...register(`packages.${idx}.fragile`)}
                            checked={Boolean(pkg?.fragile)}
                            onCheckedChange={checked => setValue(`packages.${idx}.fragile`, checked)}
                            className="data-[state=checked]:bg-amber-500"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      {/* Add button and global indicators at the bottom */}
      <div className="flex flex-col items-center gap-6 mt-8">
        {/* Global Capacity Indicators */}
        {(selectedShipmentType === 1 || (selectedShipmentType === 2 && TERRESTRIAL_LIMITS[Number(selectedVehicleType)])) && (
          <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 text-center">
              {t('expedier.departureStep.packages.capacitySummary', 'Résumé de la capacité')}
            </h4>
            
            <div className="space-y-5">
              {/* Weight indicator */}
              <div className="flex flex-col">
                {(() => {
                  const pkgs = getValues('packages') || [];
                  const totalWeight = pkgs.reduce((total, pkg) => total + ((pkg.weight || 0) * (pkg.quantity || 1)), 0);
                  const maxWeight = selectedShipmentType === 1 
                    ? 32 
                    : TERRESTRIAL_LIMITS[Number(selectedVehicleType)] || 0;
                  
                  const percentage = maxWeight > 0 ? Math.min(100, (totalWeight / maxWeight) * 100) : 0;
                  const isCloseToLimit = percentage >= 75;
                  const isAtLimit = percentage >= 95;
                  
                  return (
                    <>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "p-1.5 rounded-lg",
                            isAtLimit ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" : 
                            isCloseToLimit ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" : 
                            "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400"
                          )}>
                            <Scale className="h-4 w-4" />
                          </div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {t('expedier.departureStep.packages.totalWeight', 'Poids total')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "font-bold",
                            isAtLimit ? "text-red-600 dark:text-red-400" : 
                            isCloseToLimit ? "text-amber-600 dark:text-amber-400" : 
                            "text-teal-600 dark:text-teal-400"
                          )}>
                            {totalWeight.toFixed(1)} <span className="text-xs font-medium opacity-70">/ {maxWeight} kg</span>
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-700 ease-out",
                            isAtLimit ? "bg-red-500" : 
                            isCloseToLimit ? "bg-amber-500" : 
                            "bg-teal-500"
                          )} 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      {isCloseToLimit && (
                        <p className={cn(
                          "text-xs mt-1.5 text-right font-medium",
                          isAtLimit ? "text-red-500" : "text-amber-500"
                        )}>
                          {isAtLimit 
                            ? t('expedier.departureStep.packages.full', 'Capacité maximale atteinte')
                            : t('expedier.departureStep.packages.almostFull', 'Bientôt plein')}
                        </p>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Volume indicator */}
              {(selectedShipmentType === 1 || (selectedShipmentType === 2 && selectedVehicleType)) && (
                <div className="flex flex-col">
                  {(() => {
                    const pkgs = getValues('packages') || [];
                    const vehicleId = selectedShipmentType === 1 ? 6 : Number(selectedVehicleType);
                    const maxVolume = VEHICLE_VOLUME_LIMITS[vehicleId];
                    if (!maxVolume) return null;
                    const totalVolume = calculateTotalPackagesVolume(pkgs);
                    const totalL = cm3ToLitres(totalVolume);
                    const maxL = cm3ToLitres(maxVolume);
                    const percentage = Math.min(100, (totalVolume / maxVolume) * 100);
                    const isCloseToLimit = percentage >= 75;
                    const isAtLimit = percentage >= 95;

                    return (
                      <>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "p-1.5 rounded-lg",
                              isAtLimit ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" :
                              isCloseToLimit ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" :
                              "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                            )}>
                              <Box className="h-4 w-4" />
                            </div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {t('expedier.departureStep.packages.totalVolume', 'Volume total')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "font-bold",
                              isAtLimit ? "text-red-600 dark:text-red-400" :
                              isCloseToLimit ? "text-amber-600 dark:text-amber-400" :
                              "text-blue-600 dark:text-blue-400"
                            )}>
                              {totalL} <span className="text-xs font-medium opacity-70">/ {maxL} L</span>
                            </span>
                          </div>
                        </div>
                        <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-700 ease-out",
                              isAtLimit ? "bg-red-500" :
                              isCloseToLimit ? "bg-amber-500" :
                              "bg-blue-500"
                            )}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        {isCloseToLimit && (
                          <p className={cn(
                            "text-xs mt-1.5 text-right font-medium",
                            isAtLimit ? "text-red-500" : "text-amber-500"
                          )}>
                            {isAtLimit 
                              ? t('expedier.departureStep.packages.full', 'Capacité maximale atteinte')
                              : t('expedier.departureStep.packages.almostFull', 'Bientôt plein')}
                          </p>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        )}
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="mt-2">
                <Button
                  type="button"
                  variant="default"
                  size="lg"
                  onClick={handleAdd}
                  disabled={isLimitReached()}
                  className={cn(
                    "group relative flex items-center gap-2 px-8 py-6 rounded-2xl shadow-md transition-all duration-300 overflow-hidden",
                    !isLimitReached()
                      ? "bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white hover:shadow-lg hover:-translate-y-0.5"
                      : "bg-gray-100 dark:bg-gray-800 cursor-not-allowed text-gray-400 dark:text-gray-500"
                  )}
                >
                  {!isLimitReached() && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                  )}
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full transition-colors",
                    !isLimitReached() 
                      ? "bg-white/25" 
                      : "bg-gray-200 dark:bg-gray-700"
                  )}>
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="text-base font-semibold tracking-wide">
                    {t('expedier.departureStep.packages.add')}
                  </span>
                </Button>
              </div>
            </TooltipTrigger>
            {isLimitReached() && (
              <TooltipContent side="top" className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 max-w-xs text-center rounded-xl shadow-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span className="font-semibold text-red-800 dark:text-red-300">Limite atteinte</span>
                </div>
                <p className="text-red-700 dark:text-red-400 text-sm">
                  {(() => {
                    const pkgs = getValues('packages') || [];
                    
                    // For max package count limit
                    if (selectedShipmentType !== 1 && selectedShipmentType !== 2 && pkgs.length >= 4) {
                      return t('expedier.departureStep.packages.maxPackagesReached', 'Vous avez atteint la limite maximale de 4 colis.');
                    }

                    // For volume limits
                    if (isVolumeLimitReached()) {
                      return t('expedier.departureStep.packages.volumeLimitExceeded.message');
                    }
                    
                    // For weight limits
                    return selectedShipmentType === 1 
                      ? t('expedier.departureStep.packages.weightLimitExceeded.message', { weight: '32' }) 
                      : t('expedier.departureStep.packages.weightLimitExceeded.terrestrialError', { limit: TERRESTRIAL_LIMITS[Number(selectedVehicleType)] || 0 });
                  })()}
                </p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
} 