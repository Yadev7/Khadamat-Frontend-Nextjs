'use client';

import { useFormContext, useWatch, FieldErrors } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import { Button } from '../button';
import { CalendarIcon, InfoIcon, Globe2, Truck, EyeOff, Eye } from 'lucide-react';
import { Calendar } from '../calendar';
import { cn, formatDate, getLocalizedName } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useEffect, useState, useRef, useMemo } from 'react';
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { CarrierType, Frequency, StepperFormValues, VisibilityType, Package } from '@/types/stepper';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FileUpload from '../file-upload';

export function DepartureStep() {
  const { t, i18n } = useTranslation();
  const [stepperLanguage] = useState(i18n.language);
  const stepperRef = useRef<HTMLDivElement>(null);
  const {
    formState: { errors },
    register,
    control,
    setValue,
    watch,
    getValues,
  } = useFormContext<StepperFormValues>();
  
  const [selectedVisibility, setSelectedVisibility] = useState<VisibilityType>(() => {
    const formValues = getValues();
    return formValues?.visibility || { id: 1, name: 'Tous' };
  });

  const watchedFields = useWatch({
    control,
    name: ['startDate', 'endDate', 'publishDate', 'propositionPrice', 'thumbnailId', 'frequence', 'initialPrice']
  });
  
  const [
    startDate,
    endDate,
    publishDate,
    propositionPrice,
    thumbnailId,
    formFrequence,
    initialPrice
  ] = watchedFields;
  
  const CARRIER_TYPES: CarrierType[] = [
    { id: 1, name: 'Particulier', nameEn: 'Personal', nameAr: 'شخصي' },
    { id: 2, name: 'Professionnel', nameEn: 'Professional', nameAr: 'مهني' }
  ];
  
  const FREQUENCIES = useMemo(() => [
    {
      id: 1,
      name: t("expedier.departureStep.frequency.occasional.name"),
      icon: CalendarIcon,
      description: t("expedier.departureStep.frequency.occasional.description"),
      color: 'teal'
    },
    {
      id: 2,
      name: t("expedier.departureStep.frequency.daily.name"),
      icon: CalendarIcon,
      description: t("expedier.departureStep.frequency.daily.description"),
      color: 'purple'
    },
    {
      id: 3,
      name: t("expedier.departureStep.frequency.weekly.name"),
      icon: CalendarIcon,
      description: t("expedier.departureStep.frequency.weekly.description"),
      color: 'indigo'
    },
    {
      id: 4,
      name: t("expedier.departureStep.frequency.monthly.name"),
      icon: CalendarIcon,
      description: t("expedier.departureStep.frequency.monthly.description"),
      color: 'blue'
    }
  ] as const, [t]);

  const FREQUENCY_THEME_CLASSES: Record<number, {
    activeCard: string;
    activeIcon: string;
    activeText: string;
  }> = {
    1: {
      activeCard: 'bg-teal-50 dark:bg-teal-900/20 ring-1 ring-teal-500/20 dark:ring-teal-400/20',
      activeIcon: 'bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400',
      activeText: 'text-teal-700 dark:text-teal-300',
    },
    2: {
      activeCard: 'bg-purple-50 dark:bg-purple-900/20 ring-1 ring-purple-500/20 dark:ring-purple-400/20',
      activeIcon: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
      activeText: 'text-purple-700 dark:text-purple-300',
    },
    3: {
      activeCard: 'bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-500/20 dark:ring-indigo-400/20',
      activeIcon: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400',
      activeText: 'text-indigo-700 dark:text-indigo-300',
    },
    4: {
      activeCard: 'bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500/20 dark:ring-blue-400/20',
      activeIcon: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
      activeText: 'text-blue-700 dark:text-blue-300',
    },
  };
  
  const VISIBILITY_OPTIONS = [
    {
      id: 1,
      name: t("expedier.departureStep.visibility.options.all.name"),
      description: t("expedier.departureStep.visibility.options.all.description"),
      icon: Globe2
    },
    {
      id: 2,
      name: t("expedier.departureStep.visibility.options.transporters.name"),
      description: t("expedier.departureStep.visibility.options.transporters.description"),
      icon: Truck
    },
    {
      id: 3,
      name: t("expedier.departureStep.visibility.options.none.name"),
      description: t("expedier.departureStep.visibility.options.none.description"),
      icon: EyeOff
    }
  ] as const;
  
  const [selectedCarrierType, setSelectedCarrierType] = useState<CarrierType>(() => {
    const formValues = getValues();
    return {
      id: formValues?.carrierType?.id || CARRIER_TYPES[0].id,
      name: formValues?.carrierType?.name || CARRIER_TYPES[0].name,
      __entity: 'CarrierTypeEntity'
    };
  });
  
  const currencyFormatter = useMemo(() => {
    try {
      return new Intl.NumberFormat(i18n.language || 'fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } catch {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
  }, [i18n.language]);

  // Initialize selectedFrequency from the form values, or fall back to FREQUENCIES[0]
  const [selectedFrequency, setSelectedFrequency] = useState<Frequency>(() => {
    const formValues = getValues();
    
    if (formValues?.frequence?.id) {
      // Find the matching FREQUENCIES entry to get all properties including icon and description
      const frequencyFromConfig = FREQUENCIES.find(freq => freq.id === formValues.frequence.id);
      if (frequencyFromConfig) {
        return {
          ...frequencyFromConfig,
          __entity: formValues.frequence.__entity || 'FrequencyEntity'
        };
      }
    }
    
    return FREQUENCIES[0];
  });
  
  // Set default frequency only if not already set
  useEffect(() => {
    const currentFrequence = getValues('frequence');
    if (!currentFrequence || !currentFrequence.id) {
      const defaultFrequency = FREQUENCIES[0];
      setValue('frequency', defaultFrequency);
      setValue('frequence', {
        ...defaultFrequency,
        __entity: 'FrequencyEntity'
      });
    }
  }, [setValue, getValues, FREQUENCIES]);
  
  // Keep selectedFrequency in sync with form values
  useEffect(() => {
    if (formFrequence?.id) {
      const frequencyFromConfig = FREQUENCIES.find(freq => freq.id === formFrequence.id);
      if (frequencyFromConfig && selectedFrequency.id !== formFrequence.id) {
        setSelectedFrequency({
          ...frequencyFromConfig,
          __entity: formFrequence.__entity || 'FrequencyEntity'
        });
      }
    }
  }, [formFrequence, selectedFrequency.id, FREQUENCIES]);
  
  useEffect(() => {
    const currentVisibility = watch('visibility');
    if (currentVisibility) {
      setSelectedVisibility(currentVisibility);
    }
  }, [watch]);
  
  useEffect(() => {
    const formValues = getValues();
    if (formValues?.carrierType?.id) {
      setSelectedCarrierType(formValues.carrierType as CarrierType);
      setValue('carrierType', formValues.carrierType as CarrierType);
    }
  }, [getValues, setValue]);
  
  useEffect(() => {
    const subscription = watch((value: any) => {
      if (value.carrierType) {
        const carrierType: CarrierType = {
          id: Number(value.carrierType.id),
          name: String(value.carrierType.name),
          __entity: value.carrierType.__entity
        };
        setSelectedCarrierType(carrierType);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [watch]);
  
  const handleCarrierTypeSelect = (type: CarrierType) => {
    const carrierType: CarrierType = {
      id: type.id,
      name: type.name,
      nameEn: type.nameEn,
      nameAr: type.nameAr,
      __entity: 'CarrierTypeEntity'
    };
    setSelectedCarrierType(carrierType);
    setValue('carrierType', carrierType);
  };
  
  const handleFrequencySelect = (freq: Frequency) => {
    const frequency = {
      id: freq.id,
      name: freq.name,
      __entity: 'FrequencyEntity'
    };
    setSelectedFrequency({
      ...freq,
      __entity: 'FrequencyEntity'
    });
    setValue('frequency', frequency);
    setValue('frequence', frequency);
  };
  
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  
  const packages = useWatch({ control, name: 'packages' }) as Package[];
  
  // Automatically set publication date to current date
  useEffect(() => {
    if (!publishDate) {
      const currentDate = new Date();
      setValue('publishDate', currentDate.toISOString());
    }
  }, [setValue, publishDate]);

  // Keep proposition price aligned with base price + handling costs.
  useEffect(() => {
    if (initialPrice !== undefined && initialPrice !== null) {
      const departureHandling = Number(getValues('depart.manutention') || 0);
      const destinationHandling = Number(getValues('destination.manutention') || 0);
      const handlingCost = (departureHandling + destinationHandling) * 29;
      setValue('propositionPrice', Number(initialPrice) + handlingCost, { shouldDirty: false });
    }
  }, [initialPrice, setValue, getValues]);
  
  return (
    <div className="flex flex-col gap-6">
      {/* Thumbnail Selection Section */}
      
      <div className="mt-4">
        <Label className="flex items-center gap-2 mb-3">
          {t("expedier.departureStep.carrierType")} <span className="text-red-600">*</span>
        </Label>
        <div className="flex gap-3">
          {CARRIER_TYPES.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => handleCarrierTypeSelect(type)}
              className={cn(
                "flex-1 flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
                selectedCarrierType.id === type.id
                  ? "bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 ring-1 ring-teal-500/20 dark:ring-teal-400/20"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 ring-1 ring-gray-200 dark:ring-gray-700"
              )}
            >
              <span className={cn(
                "p-1 rounded-md",
                selectedCarrierType.id === type.id
                  ? "bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400"
                  : "bg-gray-100 dark:bg-gray-700"
              )}>
                {type.id === 1 ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                  </svg>
                )}
              </span>
              {getLocalizedName(type, i18n.language)}
            </button>
          ))}
        </div>
      </div>
      
      <div className="mt-4">
        <Label className="flex items-center gap-2 mb-3">
          {t("expedier.departureStep.frequency.title")}
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {FREQUENCIES.map((freq) => {
            const Icon = freq.icon;
            const theme = FREQUENCY_THEME_CLASSES[freq.id] || FREQUENCY_THEME_CLASSES[1];
            return (
              <button
                key={freq.id}
                type="button"
                onClick={() => handleFrequencySelect(freq)}
                className={cn(
                  "group relative p-4 flex flex-col items-center text-center rounded-xl transition-all duration-200",
                  selectedFrequency.id === freq.id
                    ? theme.activeCard
                    : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 ring-1 ring-gray-200 dark:ring-gray-700"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg transition-colors duration-200",
                  selectedFrequency.id === freq.id
                    ? theme.activeIcon
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-600"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={cn(
                  "mt-2 font-medium text-sm",
                  selectedFrequency.id === freq.id
                    ? theme.activeText
                    : "text-gray-700 dark:text-gray-300"
                )}>
                  {freq.name}
                </span>
                <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {freq.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Enhanced Fields Layout */}
      <div className="mt-8">
        {/* Price Proposition Section with Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-6 transition-shadow hover:shadow-md">
          <div className="flex items-center mb-3">
            <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <Label htmlFor="initialPrice" className="font-semibold text-base">{t("expedier.departureStep.price.label")} <span className="text-red-600">*</span></Label>
          </div>
          
          {/* Price Input */}
          <div className="relative mb-4">
            <Input
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 pr-6"
              id="initialPrice"
              type='number'
              min={0}
              step="0.01"
              {...register('initialPrice', {
                required: t("expedier.departureStep.validation.priceRequired"),
                min: { value: 0, message: t("expedier.departureStep.validation.pricePositive") }
              })}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">€</div>
          </div>
          
          {/* Price Breakdown (Receipt style) */}
          {initialPrice && Number(initialPrice) > 0 && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">{t("expedier.departureStep.price.commission.label")}</span>
                <span className="text-gray-600 dark:text-gray-400">
                  - {currencyFormatter.format(Number(initialPrice) * 0.15)}
                </span>
              </div>
              <div className="flex items-center justify-between font-semibold mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-900 dark:text-gray-100">{t("expedier.departureStep.price.commission.transporterReceives")}</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {currencyFormatter.format(Number(initialPrice) * 0.85)}
                </span>
              </div>
              <div className="flex items-start mt-4 text-xs text-gray-600 dark:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a1 1 0 100 2 1 1 0 000-2zM9 9a1 1 0 000 2v3a1 1 0 102 0v-3a1 1 0 10-2 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-2">{t("expedier.departureStep.price.commission.info")}</span>
              </div>
            </div>
          )}
          
          {errors.initialPrice && <p className="text-sm font-medium text-red-600 mt-2">{String(errors.initialPrice.message)}</p>}
        </div>
        
        {/* Dates Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-6 transition-shadow hover:shadow-md">
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 mr-3">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base">{t("expedier.departureStep.dates.title", "Dates d'annonce")}</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                {t("expedier.departureStep.dates.start")} <span className="text-red-600 ml-1">*</span>
              </Label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? formatDate(new Date(startDate), "PPP", i18n.language) : <span>{t("expedier.departureStep.dates.selectDate")}</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate ? new Date(startDate) : undefined}
                    onSelect={(value) => {
                      setValue('startDate', value ? value.toLocaleDateString('en-CA') : '');
                      setStartDateOpen(false);
                    }}
                    {...register('startDate', {
                      required: t("expedier.departureStep.validation.startDateRequired"),
                    })}
                    disabled={date => 
                      date < new Date(new Date().setHours(0,0,0,0)) || (endDate ? date > new Date(endDate) : false)
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.startDate && (
                <p className="text-sm font-medium text-red-600">
                  {String(errors.startDate.message)}
                </p>
              )}
            </div>
            
            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                {t("expedier.departureStep.dates.end")} <span className="text-red-600 ml-1">*</span>
              </Label>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? formatDate(new Date(endDate), "PPP", i18n.language) : <span>{t("expedier.departureStep.dates.selectDate")}</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate ? new Date(endDate) : undefined}
                    onSelect={(value) => {
                      setValue('endDate', value ? value.toLocaleDateString('en-CA') : '');
                      setEndDateOpen(false);
                    }}
                    initialFocus
                    {...register('endDate', {
                      required: t("expedier.departureStep.validation.endDateRequired"),
                    })}
                    disabled={date => 
                      !startDate || date.getTime() < new Date(startDate).setHours(0,0,0,0)
                    }
                  />
                </PopoverContent>
              </Popover>
              {errors.endDate && (
                <p className="text-sm font-medium text-red-600">
                  {String(errors.endDate.message)}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Visibility Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 transition-shadow hover:shadow-md">
          <div className="flex items-center mb-3">
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 mr-3">
              <Eye className="w-5 h-5" />
            </div>
            <Label htmlFor="visibility" className="font-semibold text-base">{t("expedier.departureStep.visibility.label")}</Label>
          </div>
          
          <div className="flex items-center gap-1 mt-2 mb-4 text-xs text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 p-2 rounded-lg">
            <InfoIcon className="h-3.5 w-3.5 flex-shrink-0" />
            <p>{t("expedier.departureStep.visibility.info")}</p>
          </div>
          
          <Select
            onValueChange={(value) => {
              const visibilityId = Number(value);
              const selectedOption = VISIBILITY_OPTIONS.find(opt => opt.id === visibilityId);
              if (selectedOption) {
                setValue('visibility', {
                  id: visibilityId,
                  name: selectedOption.name,
                  __entity: 'AnnouncementsVisibilityEntity'
                });
              }
            }}
            value={String(watch('visibility.id'))}
          >
            <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <SelectValue>
                {VISIBILITY_OPTIONS.find(opt => opt.id === watch('visibility.id'))?.name || t("expedier.departureStep.visibility.label")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              {VISIBILITY_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <SelectItem
                    key={option.id}
                    value={String(option.id)}
                    className="flex items-center gap-2 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-700">
                        <Icon className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">{option.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{option.description}</span>
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
