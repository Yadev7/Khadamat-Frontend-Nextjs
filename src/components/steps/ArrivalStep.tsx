import { useState, useEffect, useMemo, useCallback, useRef, forwardRef, startTransition } from 'react';
import { useFormContext, useWatch, Path } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Country as CountryType, LocationType, ShippingDetails, StepperFormValues } from '@/types/stepper';
import { Label } from '../label';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDepartureRegionsByCountry, fetchDestinationRegionsByCountry } from '@/redux/locationReducer';
import { RootState } from '@/redux/store';
import { Input } from '../input';
import { DraggableMap } from '@/components/Map/DraggableMap';
import { Switch } from '../switch'; // Import your Switch component
import { PhoneInput } from '../phone-input';
import * as RPNInput from 'react-phone-number-input';
import { isValidPhoneNumber } from 'react-phone-number-input';
import { MapPin, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useContext } from 'react';
import { StepperContext } from '../stepper';
import React from 'react';
import {
  departureCitySelectRef,
  departureCountrySelectRef,
  destinationCitySelectRef,
  destinationCountrySelectRef,
} from './stepperRefs';

// Add helper function for type conversion
const convertToString = (value: boolean | number | string | undefined): string => {
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  return value || '';
};

interface CountryData {
  id: number;
  name: {
    ar: string;
    fr: string;
    sp: string;
    en: string;
  };
  coordinates: [number, number];
  cities: Array<{
    id: number;
    name: string;
    coordinates: [number, number];
    country: CountryData;
    createdAt: string;
    updatedAt: string;
  }>;
  flag: string;
  createdAt: string;
  updatedAt: string;
}

// Add type for nested errors
type NestedErrors = {
  depart?: {
    cityId?: { message: string };
    adresse?: { message: string };
    locationTypeId?: { message: string };
    full_name?: { message: string };
    function?: { message: string };
    phoneNumber?: { message: string };
    email?: { message: string };
    elevator?: { message: string };
    floor?: { message: string };
    coordinates?: { message: string };
  };
  destination?: {
    cityId?: { message: string };
    adresse?: { message: string };
    locationTypeId?: { message: string };
    full_name?: { message: string };
    function?: { message: string };
    phoneNumber?: { message: string };
    email?: { message: string };
    elevator?: { message: string };
    floor?: { message: string };
    coordinates?: { message: string };
  };
  manutention?: { message: string };
};
interface CountryName {
  ar: string;
  fr: string;
  sp: string;
  en: string;
  [key: string]: string;
}

interface Country {
  id: number;
  name: CountryName;
  coordinates: [number, number];
  flag: string;
}

const sortByName = (a: any, b: any) => {
  const nameA = a?.name?.fr || a?.name?.en || a?.name?.ar || '';
  const nameB = b?.name?.fr || b?.name?.en || b?.name?.ar || '';
  return nameA.localeCompare(nameB);
};

const sortBySimpleName = (a: any, b: any) => {
  return a.name.localeCompare(b.name);
};

// Add a helper message component for selects
const SelectHelper = ({ 
  message, 
  icon = true, 
  visible = true 
}: { 
  message: string; 
  icon?: boolean; 
  visible?: boolean 
}) => {
  if (!visible) return null;
  
  return (
    <div className="flex items-center gap-2 mt-1 text-xs text-teal-600 dark:text-teal-400 transition-opacity duration-200">
      {icon && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>}
      <span>{message}</span>
    </div>
  );
};

export function ArrivalStep() {
  const dispatch = useDispatch();
  const { departureRegions, destinationRegions } = useSelector((state: RootState) => state.location);
  const { countries, contactTypes } = useSelector((state: RootState) => state.website);
  const { locationTypes } = useSelector((state: RootState) => state.website);
  const { register, setValue, control, formState: { errors }, setError, clearErrors, watch, trigger } = useFormContext<StepperFormValues>();
  const errorsTyped = errors as unknown as NestedErrors;

  const { i18n, t } = useTranslation();
  const [initialLang, setInitialLang] = useState<keyof CountryName>(i18n.language as keyof CountryName);
  const currentLang = i18n.language as keyof CountryName;

  useEffect(() => {
    setInitialLang(i18n.language as keyof CountryName);
  }, [i18n.language]);

  const { stepperLanguage } = useContext(StepperContext);

  const getCountryName = (country: Country) => {
    if (!country?.name) return '';
    return country.name[stepperLanguage as keyof CountryName] || country.name.fr || country.name.ar || country.name.en;
  };

  const sortByName = (a: Country, b: Country) => {
    if (!a?.name || !b?.name) return 0;
    const nameA = getCountryName(a);
    const nameB = getCountryName(b);
    return nameA.localeCompare(nameB);
  };

  const [departManutention, setDepartManutention] = useState<number>(0);
  const [destinationManutention, setDestinationManutention] = useState<number>(0);

  const [selectedDepartureCountryId, setSelectedDepartureCountryId] = useState<string>('');
  const [selectedDestinationCountryId, setSelectedDestinationCountryId] = useState<string>('');
  const [selectedDepartureCountryData, setSelectedDepartureCountryData] = useState<CountryData | null>(null);
  const [selectedDestinationCountryData, setSelectedDestinationCountryData] = useState<CountryData | null>(null);
  const [selectedDepartureRegion, setSelectedDepartureRegion] = useState<string>('');
  const [selectedDepartureTypeAdresse, setSelectedDepartureTypeAdresse] = useState<string>('');
  const [selectedDestinationTypeAdresse, setSelectedDestinationTypeAdresse] = useState<string>('');
  const [selectedDestinationRegion, setSelectedDestinationRegion] = useState<string>('');
  const [hasExactDepartureLocation, setHasExacDeparturetLocation] = useState<boolean>(false); // State for the switch
  const [hasExactDestinationLocation, setHasExactDestinationLocation] = useState<boolean>(false); // State for the switch
  const [departValues, destinationValues, initialPrice] = useWatch({
    control,
    name: ['depart', 'destination', 'initialPrice']
  });

  const [departCitySearch, setDepartCitySearch] = useState('');
  const [destinationCitySearch, setDestinationCitySearch] = useState('');
  
  // Add refs for search inputs to maintain stability
  const departSearchRef = useRef<HTMLInputElement>(null);
  const destinationSearchRef = useRef<HTMLInputElement>(null);
  const phoneValidationTimersRef = useRef<{
    depart?: ReturnType<typeof setTimeout>;
    destination?: ReturnType<typeof setTimeout>;
  }>({});
  const [departSearchFocused, setDepartSearchFocused] = useState(false);
  const [destinationSearchFocused, setDestinationSearchFocused] = useState(false);

  // Debounced validation for phone numbers to reduce lag
  const debouncedValidatePhone = useCallback((fieldName: 'depart.phoneNumber' | 'destination.phoneNumber') => {
    const timerKey = fieldName.startsWith('depart') ? 'depart' : 'destination';
    const existingTimer = phoneValidationTimersRef.current[timerKey];
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    phoneValidationTimersRef.current[timerKey] = setTimeout(() => {
      trigger(fieldName as Path<StepperFormValues>);
    }, 500);
  }, [trigger]);

  useEffect(() => {
    const timers = phoneValidationTimersRef.current;

    return () => {
      if (timers.depart) {
        clearTimeout(timers.depart);
      }
      if (timers.destination) {
        clearTimeout(timers.destination);
      }
    };
  }, []);

  useEffect(() => {
    register('depart.countryId', { required: t('expedier.arrivalStep.validation.country') });
    register('depart.cityId', { required: t('expedier.arrivalStep.validation.city') });
    register('depart.location_type', { required: t('expedier.arrivalStep.validation.locationType') });

    register('destination.countryId', { required: t('expedier.arrivalStep.validation.country') });
    register('destination.cityId', { required: t('expedier.arrivalStep.validation.city') });
    register('destination.location_type', { required: t('expedier.arrivalStep.validation.locationType') });
    
    // Register phone number fields with custom validation
    register('depart.phoneNumber', { 
      required: t('expedier.arrivalStep.validation.phone'),
      validate: (value) => {
        if (!value) return t('expedier.arrivalStep.validation.phone');
        return isValidPhoneNumber(value) || t('expedier.arrivalStep.validation.invalidPhone');
      }
    });
    
    register('destination.phoneNumber', { 
      required: t('expedier.arrivalStep.validation.phone'),
      validate: (value) => {
        if (!value) return t('expedier.arrivalStep.validation.phone');
        return isValidPhoneNumber(value) || t('expedier.arrivalStep.validation.invalidPhone');
      }
    });
  }, [register, t]);

  useEffect(() => {
    if (departValues?.manutention !== undefined) {
      setDepartManutention(departValues.manutention);
    }
    if (destinationValues?.manutention !== undefined) {
      setDestinationManutention(destinationValues.manutention);
    }
  }, [departValues?.manutention, destinationValues?.manutention]);

  // Update propositionPrice when manutention changes
  useEffect(() => {
    const basePrice = Number(initialPrice) || 0;
    const totalManutentionCost = ((departManutention || 0) + (destinationManutention || 0)) * 29;
    
    if (basePrice > 0) {
      setValue('propositionPrice', basePrice + totalManutentionCost);
    }
  }, [departManutention, destinationManutention, initialPrice, setValue]);

  useEffect(() => {
    if (departValues?.cityId) {
      // Find the country that contains this city
      const countryWithCity = countries.find((country: CountryData) =>
        country.cities?.some(city => city.id === departValues.cityId)
      );

      if (countryWithCity) {
        setSelectedDepartureCountryId(String(countryWithCity.id));
        setSelectedDepartureCountryData(countryWithCity);
        setValue('depart.countryId', countryWithCity.id, { shouldValidate: true });
      } else if (departValues?.countryId) {
        // Fallback to countryId if city not found in any country (or city list not loaded yet)
        const country = countries.find((c: CountryData) => c.id === Number(departValues.countryId));
        if (country) {
          setSelectedDepartureCountryId(String(country.id));
          setSelectedDepartureCountryData(country);
        }
      }
    } else if (departValues?.countryId) {
      // If no cityId but countryId exists
      const country = countries.find((c: CountryData) => c.id === Number(departValues.countryId));
      if (country) {
        setSelectedDepartureCountryId(String(country.id));
        setSelectedDepartureCountryData(country);
      }
    }

    if (destinationValues?.cityId) {
      // Find the country that contains this city
      const countryWithCity = countries.find((country: CountryData) =>
        country.cities?.some(city => city.id === destinationValues.cityId)
      );

      if (countryWithCity) {
        setSelectedDestinationCountryId(String(countryWithCity.id));
        setSelectedDestinationCountryData(countryWithCity);
        setValue('destination.countryId', countryWithCity.id, { shouldValidate: true });
      } else if (destinationValues?.countryId) {
        // Fallback to countryId
        const country = countries.find((c: CountryData) => c.id === Number(destinationValues.countryId));
        if (country) {
          setSelectedDestinationCountryId(String(country.id));
          setSelectedDestinationCountryData(country);
        }
      }
    } else if (destinationValues?.countryId) {
      // If no cityId but countryId exists
      const country = countries.find((c: CountryData) => c.id === Number(destinationValues.countryId));
      if (country) {
        setSelectedDestinationCountryId(String(country.id));
        setSelectedDestinationCountryData(country);
      }
    }
  }, [countries, departValues?.cityId, destinationValues?.cityId, departValues?.countryId, destinationValues?.countryId, setValue]);

  const handleDepartureCountryChange = useCallback((countryId: string) => {
    // Use startTransition to mark non-urgent updates
    startTransition(() => {
      // Batch all state updates
      const countryNumId = Number(countryId);
      const currentCountryId = watch('depart.countryId');
      const countryData = countries.find((country: CountryData) => country.id === countryNumId);
      
      // Update form values first (most important)
      setValue('depart.countryId', countryNumId, { shouldValidate: true });
      
      // Only reset cityId if the country is different
      if (countryNumId !== currentCountryId) {
        setValue('depart.cityId', 0);
      }
      
      // Update state in batch
      setSelectedDepartureCountryId(countryId);
      setSelectedDepartureCountryData(countryData || null);
      setDepartCitySearch('');
      
      // Defer phone validation to avoid blocking
      if (departValues?.phoneNumber) {
        setTimeout(() => {
          debouncedValidatePhone('depart.phoneNumber');
        }, 100);
      }
    });
  }, [setValue, watch, countries, departValues?.phoneNumber, debouncedValidatePhone]);

  const handleDestinationCountryChange = useCallback((countryId: string) => {
    // Use startTransition to mark non-urgent updates
    startTransition(() => {
      // Batch all state updates
      const countryNumId = Number(countryId);
      const currentCountryId = watch('destination.countryId');
      const countryData = countries.find((country: CountryData) => country.id === countryNumId);
      
      // Update form values first (most important)
      setValue('destination.countryId', countryNumId, { shouldValidate: true });
      
      // Only reset cityId if the country is different
      if (countryNumId !== currentCountryId) {
        setValue('destination.cityId', 0);
      }
      
      // Update state in batch
      setSelectedDestinationCountryId(countryId);
      setSelectedDestinationCountryData(countryData || null);
      setDestinationCitySearch('');
      
      // Defer phone validation to avoid blocking
      if (destinationValues?.phoneNumber) {
        setTimeout(() => {
          debouncedValidatePhone('destination.phoneNumber');
        }, 100);
      }
    });
  }, [setValue, watch, countries, destinationValues?.phoneNumber, debouncedValidatePhone]);

  // Handle clearing search on city selection
  const handleSelectDepartureCity = (value: string) => {
    setValue('depart.cityId', Number(value));
    setDepartCitySearch(''); // Clear search after selection
  };

  const handleSelectDestinationCity = (value: string) => {
    setValue('destination.cityId', Number(value));
    setDestinationCitySearch(''); // Clear search after selection
  };

  // Optimize phone input handlers to reduce re-renders
  const handleDepartPhoneChange = useCallback((value: RPNInput.Value) => {
    setValue('depart.phoneNumber', (value || '') as any);
    debouncedValidatePhone('depart.phoneNumber');
  }, [setValue, debouncedValidatePhone]);

  const handleDestinationPhoneChange = useCallback((value: RPNInput.Value) => {
    setValue('destination.phoneNumber', (value || '') as any);
    debouncedValidatePhone('destination.phoneNumber');
  }, [setValue, debouncedValidatePhone]);

  const handleDepartureRegionChange = (regionId: string) => {
    setSelectedDepartureRegion(regionId);
    setValue('infos_contacts_depart.adresse.region_id' as keyof StepperFormValues, regionId);
  };

  const handleDestinationRegionChange = (regionId: string) => {
    setSelectedDestinationRegion(regionId);
    setValue('infos_contacts_destination.adresse.region_id' as keyof StepperFormValues, regionId);
  };

  // Get coordinates for selected country and region
  const departurecountryCoordinates = countries.find((country: { id: number; name: string; x: number; y: number }) => country.id === Number(selectedDepartureCountryId));
  const departureRegionCoordinates = departureRegions.find((region: { id: number; name: string; x: number; y: number }) => region.id === Number(selectedDepartureRegion));

  const destinationCountryCoordinates = countries.find((country: { id: number; name: string; x: number; y: number }) => country.id === Number(selectedDestinationCountryId));
  const destinationRegionCoordinates = destinationRegions.find((region: { id: number; name: string; x: number; y: number }) => region.id === Number(selectedDestinationRegion));

  // Auto-enable map if coordinates exist
  useEffect(() => {
    if (departValues?.coordinates && (departValues.coordinates[0] !== 0 || departValues.coordinates[1] !== 0)) {
      setHasExacDeparturetLocation(true);
    }
  }, [departValues?.coordinates]);

  useEffect(() => {
    if (destinationValues?.coordinates && (destinationValues.coordinates[0] !== 0 || destinationValues.coordinates[1] !== 0)) {
      setHasExactDestinationLocation(true);
    }
  }, [destinationValues?.coordinates]);

  // Capture initial coordinates from form on first render (for edit/prefill scenarios)
  // We use a ref so this value is stable and doesn't cause feedback loops from drag updates
  const initialDepartCoordsRef = useRef<{ lng: number; lat: number } | null>(null);
  if (!initialDepartCoordsRef.current && departValues?.coordinates && 
      (departValues.coordinates[0] !== 0 || departValues.coordinates[1] !== 0)) {
    initialDepartCoordsRef.current = {
      lng: Number(departValues.coordinates[0]),
      lat: Number(departValues.coordinates[1])
    };
  }

  const initialDestCoordsRef = useRef<{ lng: number; lat: number } | null>(null);
  if (!initialDestCoordsRef.current && destinationValues?.coordinates && 
      (destinationValues.coordinates[0] !== 0 || destinationValues.coordinates[1] !== 0)) {
    initialDestCoordsRef.current = {
      lng: Number(destinationValues.coordinates[0]),
      lat: Number(destinationValues.coordinates[1])
    };
  }

  const initialDepartureCoordinates = useMemo(() => {
    // Use the initial ref value if available (prefilled/edit case)
    if (initialDepartCoordsRef.current) {
      return initialDepartCoordsRef.current;
    }

    // Otherwise, derive from selected city
    const selectedCity = selectedDepartureCountryData?.cities?.find(
      city => city.id === departValues?.cityId
    );

    return {
      lng: Number(selectedCity?.coordinates[0] || 2.34839),
      lat: Number(selectedCity?.coordinates[1] || 48.85350)
    };
  }, [selectedDepartureCountryData, departValues?.cityId]);


  const initialDestinationCoordinates = useMemo(() => {
    // Use the initial ref value if available (prefilled/edit case)
    if (initialDestCoordsRef.current) {
      return initialDestCoordsRef.current;
    }

    // Otherwise, derive from selected city
    const selectedCity = selectedDestinationCountryData?.cities?.find(
      city => city.id === destinationValues?.cityId
    );

    return {
      lng: Number(selectedCity?.coordinates[0] || 2.34839),
      lat: Number(selectedCity?.coordinates[1] || 48.85350)
    };
  }, [selectedDestinationCountryData, destinationValues?.cityId]);

  // Get stable values for departure map memoization
  const departCityId = departValues?.cityId;
  
  const memoizedDepartureMap = useMemo(() => (
    hasExactDepartureLocation && selectedDepartureCountryId && departCityId && (
      <div className={`transition-opacity duration-500 ${hasExactDepartureLocation ? 'opacity-100' : 'opacity-0'}`}>
        <div className="p-2 border rounded-md border-dashed">
          <Label>Lieu de départ</Label>
          <DraggableMap
            formFieldPrefix="depart"
            initialCoordinates={initialDepartureCoordinates}
            showCoordinates={false}
          />
        </div>
      </div>
    )
  ), [hasExactDepartureLocation, selectedDepartureCountryId, departCityId, initialDepartureCoordinates]);

  // Get stable values for destination map memoization
  const destinationCityId = destinationValues?.cityId;
  
  const memoizedDestinationMap = useMemo(() => (
    hasExactDestinationLocation && selectedDestinationCountryId && destinationCityId && (
      <div className={`transition-opacity duration-500 ${hasExactDestinationLocation ? 'opacity-100' : 'opacity-0'}`}>
        <div className="p-2 border rounded-md border-dashed">
          <Label>Lieu de destination</Label>
          <DraggableMap
            formFieldPrefix="destination"
            initialCoordinates={initialDestinationCoordinates}
            showCoordinates={false}
          />
        </div>
      </div>
    )
  ), [hasExactDestinationLocation, selectedDestinationCountryId, destinationCityId, initialDestinationCoordinates]);

  // Watch for root-level shipment_type instead of nested in depart
  const [formShipmentType] = useWatch({
    control,
    name: ['shipment_type']
  });

  const defaultCoordinates: [number, number] = [0, 0];


  useEffect(() => {
    if (!hasExactDepartureLocation) {
      setValue('depart.coordinates', [0, 0]);
    }
  }, [hasExactDepartureLocation, setValue]);

  useEffect(() => {
    if (!hasExactDestinationLocation) {
      setValue('destination.coordinates', [0, 0]);
    }
  }, [hasExactDestinationLocation, setValue]);

  useEffect(() => {
    if (selectedDepartureCountryData?.cities && departValues?.cityId) {
      const selectedCity = selectedDepartureCountryData.cities.find(city => city.id === departValues.cityId);
      if (selectedCity) {
        setValue('depart.cityId', selectedCity.id);
      }
    }
    
    if (selectedDestinationCountryData?.cities && destinationValues?.cityId) {
      const selectedCity = selectedDestinationCountryData.cities.find(city => city.id === destinationValues.cityId);
      if (selectedCity) {
        setValue('destination.cityId', selectedCity.id);
      }
    }
  }, [selectedDepartureCountryData, selectedDestinationCountryData, departValues?.cityId, destinationValues?.cityId, setValue]);

  const [departCountry, departCity] = useWatch({
    control,
    name: ['depart.countryId', 'depart.cityId']
  });

  const [destCountry, destCity] = useWatch({
    control,
    name: ['destination.countryId', 'destination.cityId']
  });


  // Remove circular dependencies by using refs to track if change is external
  const isDepartureChangeExternal = useRef(true);
  const isDestinationChangeExternal = useRef(true);

  useEffect(() => {
    if (departCountry && isDepartureChangeExternal.current) {
      isDepartureChangeExternal.current = false;
      handleDepartureCountryChange(String(departCountry));
      // Reset flag after a brief delay
      setTimeout(() => {
        isDepartureChangeExternal.current = true;
      }, 50);
    }
  }, [departCountry, handleDepartureCountryChange]);

  useEffect(() => {
    if (destCountry && isDestinationChangeExternal.current) {
      isDestinationChangeExternal.current = false;
      handleDestinationCountryChange(String(destCountry));
      // Reset flag after a brief delay
      setTimeout(() => {
        isDestinationChangeExternal.current = true;
      }, 50);
    }
  }, [destCountry, handleDestinationCountryChange]);

  const getCountryCode = useCallback((countryId: string | number): RPNInput.Country => {
    if (!countryId) return 'MA'; // Default to Morocco if no country selected
    
    const country = countries.find((c: any) => c.id === Number(countryId));
    if (!country) return 'MA';
    
    // Map country names to ISO country codes for phone input
    const nameToCodeMapping: Record<string, RPNInput.Country> = {
      'Morocco': 'MA',
      'Maroc': 'MA',
      'France': 'FR',
      'Spain': 'ES',
      'Espagne': 'ES',
      'United States': 'US',
      'États-Unis': 'US',
      'United Kingdom': 'GB',
      'Royaume-Uni': 'GB',
      'Germany': 'DE',
      'Allemagne': 'DE',
      'Italy': 'IT',
      'Italie': 'IT',
      'Netherlands': 'NL',
      'Pays-Bas': 'NL',
      'Belgium': 'BE',
      'Belgique': 'BE',
      'Switzerland': 'CH',
      'Suisse': 'CH',
      'Portugal': 'PT',
      'Canada': 'CA',
      'Algeria': 'DZ',
      'Algérie': 'DZ',
      'Tunisia': 'TN',
      'Tunisie': 'TN',
      'Senegal': 'SN',
      'Sénégal': 'SN',
      // Add more countries as needed
    };
    
    // Try to find a match in English, French, Arabic or Spanish country names
    const countryName = country.name.en || country.name.fr || country.name.ar || country.name.sp || '';
    const countryCode = nameToCodeMapping[countryName];
    
    return countryCode || 'MA'; // Default to Morocco if no match
  }, [countries]);

  // Get the current country code for departure phone input
  const departureCountryCode = useMemo(() => {
    return getCountryCode(selectedDepartureCountryId);
  }, [selectedDepartureCountryId, getCountryCode]);
  
  // Get stable values for memoization
  const departPhoneValue = departValues?.phoneNumber;
  const departPhoneError = errorsTyped.depart?.phoneNumber;
  
  // Memoize the phone input components to reduce re-renders
  const DeparturePhoneInput = useMemo(() => (
    <div>
      <Label htmlFor="depart.phoneNumber">{t('expedier.arrivalStep.form.phone')} <span className="text-red-600">*</span>:</Label>
      <PhoneInput
        value={departPhoneValue}
        onChange={handleDepartPhoneChange}
        defaultCountry={departureCountryCode}
        required
        className={departPhoneError ? "border-red-500" : ""}
      />
      {departPhoneError && (
        <p className="text-sm font-medium text-red-600">
          {departPhoneError.message}
        </p>
      )}
    </div>
  ), [
    departPhoneValue, 
    handleDepartPhoneChange, 
    departureCountryCode,
    departPhoneError,
    t
  ]);

  // Get the current country code for destination phone input
  const destinationCountryCode = useMemo(() => {
    return getCountryCode(selectedDestinationCountryId);
  }, [selectedDestinationCountryId, getCountryCode]);

  // Get stable values for destination phone memoization
  const destinationPhoneValue = destinationValues?.phoneNumber;
  const destinationPhoneError = errorsTyped.destination?.phoneNumber;

  const DestinationPhoneInput = useMemo(() => (
    <div>
      <Label htmlFor="destination_tel">{t('expedier.arrivalStep.form.phone')}: <span className="text-red-600">*</span>:</Label>
      <PhoneInput
        value={destinationPhoneValue}
        onChange={handleDestinationPhoneChange}
        defaultCountry={destinationCountryCode}
        required
        className={destinationPhoneError ? "border-red-500" : ""}
      />
      {destinationPhoneError && (
        <p className="text-sm font-medium text-red-600">
          {destinationPhoneError.message}
        </p>
      )}
    </div>
  ), [
    destinationPhoneValue, 
    handleDestinationPhoneChange, 
    destinationCountryCode,
    destinationPhoneError,
    t
  ]);

  // Filtered cities based on search
  const filteredDepartureCities = useMemo(() => {
    if (!selectedDepartureCountryData?.cities?.length) return [];
    
    return selectedDepartureCountryData.cities.filter(city => 
      city.name.toLowerCase().includes(departCitySearch.toLowerCase())
    ).sort(sortBySimpleName);
  }, [selectedDepartureCountryData, departCitySearch]);

  // Filtered cities for destination
  const filteredDestinationCities = useMemo(() => {
    if (!selectedDestinationCountryData?.cities?.length) return [];
    
    return selectedDestinationCountryData.cities.filter(city => 
      city.name.toLowerCase().includes(destinationCitySearch.toLowerCase())
    ).sort(sortBySimpleName);
  }, [selectedDestinationCountryData, destinationCitySearch]);

  // Handle closing/opening of selects to prevent focus errors
  const handleDepartureOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setDepartCitySearch('');
      // Make sure to blur the input to prevent focus issues
      if (departSearchRef.current) {
        departSearchRef.current.blur();
      }
    }
  }, []);

  const handleDestinationOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setDestinationCitySearch('');
      // Make sure to blur the input to prevent focus issues
      if (destinationSearchRef.current) {
        destinationSearchRef.current.blur();
      }
    }
  }, []);

  // Stop event propagation to prevent Radix UI from capturing them
  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    e.stopPropagation();
    // Only when pressing Escape without search text, let the event bubble up
    if (e.key === 'Escape') {
      const input = e.target as HTMLInputElement;
      if (!input.value) {
        return; // Let Escape bubble up to close the dropdown
      }
      e.preventDefault(); // Prevent dropdown from closing if there's text
    }
  }, []);

  return (
    <div className="flex flex-col gap-6 text-base">
      <div className="flex flex-col gap-2">
        <div>
          <h2 className="font-semibold">{t('expedier.arrivalStep.title.departureAddress')}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('expedier.arrivalStep.subtitle.departure')}
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-x-4 gap-y-2">
          <div>
            <Label htmlFor="pays">{t('expedier.arrivalStep.form.country')} : <span className="text-red-500">*</span></Label>
            <Select
              onValueChange={handleDepartureCountryChange}
              value={selectedDepartureCountryId}
            >
              <SelectTrigger 
                ref={departureCountrySelectRef}
                className={`bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${errors.depart?.countryId ? 'border-red-500 focus:ring-red-500' : ''}`}
              >
                <SelectValue placeholder={t('expedier.arrivalStep.select.country')} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                {[...countries].sort(sortByName).map((country: Country) => (
                  <SelectItem key={country.id} value={String(country.id)}>
                    {getCountryName(country)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.depart?.countryId && (
              <p className="text-sm font-medium text-red-600">
                {t('expedier.arrivalStep.validation.country')}
              </p>
            )}
            <SelectHelper 
              message={t('expedier.arrivalStep.select.countryFirst')} 
              visible={!selectedDepartureCountryId}
            />
          </div>
          <div>
            <Label htmlFor="depart.cityId">{t('expedier.arrivalStep.form.city')} : <span className="text-red-500">*</span></Label>
            <Select
              onValueChange={handleSelectDepartureCity}
              value={String(departValues?.cityId || '')}
              disabled={!selectedDepartureCountryId}
              onOpenChange={handleDepartureOpenChange}
            >
              <SelectTrigger 
                ref={departureCitySelectRef}
                className={`bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${
                  errorsTyped.depart?.cityId ? 'border-red-500 focus:ring-red-500' : ''
                } ${
                  !selectedDepartureCountryId ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                <SelectValue placeholder={
                  !selectedDepartureCountryId 
                    ? t('expedier.arrivalStep.select.countryFirst')
                    : t('expedier.arrivalStep.select.city')
                } />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                {selectedDepartureCountryId && (
                  <div 
                    className="flex items-center px-3 py-2 sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
                    onClick={(e) => {
                      // Prevent click from closing the dropdown
                      e.stopPropagation();
                    }}
                  >
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <input
                      // Using a native input instead of the Input component for better focus control
                      ref={departSearchRef}
                      placeholder={t('expedier.arrivalStep.select.searchCity')}
                      value={departCitySearch}
                      onChange={(e) => setDepartCitySearch(e.target.value)}
                      className="h-11 w-full border-none bg-transparent p-0 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      onKeyDown={handleSearchKeyDown}
                      onFocus={() => setDepartSearchFocused(true)}
                      onBlur={() => setDepartSearchFocused(false)}
                      // Prevent click from bubbling to parent components
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      autoComplete="off"
                    />
                  </div>
                )}
                {selectedDepartureCountryId && filteredDepartureCities.length ? (
                  filteredDepartureCities.map((city: { id: number; name: string }) => (
                    <SelectItem key={city.id} value={String(city.id)}>
                      {city.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="text-center py-2 text-sm text-gray-500">
                    {selectedDepartureCountryId 
                      ? departCitySearch 
                        ? t('expedier.arrivalStep.departure.noCityFound') 
                        : t('expedier.arrivalStep.select.noCity') 
                      : t('expedier.arrivalStep.select.countryFirst')}
                  </div>
                )}
              </SelectContent>
            </Select>
            {errorsTyped.depart?.cityId && (
              <p className="text-sm font-medium text-red-600">{t('expedier.arrivalStep.validation.city')}</p>
            )}
            {selectedDepartureCountryId && !selectedDepartureCountryData?.cities?.length && (
              <SelectHelper message={t('expedier.arrivalStep.select.noCity')} />
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-x-4 gap-y-2">
          <div className="col-span-2">
            <Label htmlFor="depart.adresse">{t('expedier.arrivalStep.form.address')} : <span className="text-red-500">*</span>
            </Label>
            <Input
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              id="depart.adresse"
              {...register('depart.adresse', { required: t('expedier.arrivalStep.validation.address') })}
              value={departValues?.adresse || ''}
              onChange={(e) => setValue('depart.adresse', e.target.value)}
            />
            {errorsTyped.depart?.adresse && (
              <p className="text-sm font-medium text-red-600">
                {errorsTyped.depart?.adresse.message}
              </p>
            )}
          </div>
          {formShipmentType?.id !== 1 && (
            <div>
              <Label htmlFor="manutention">{t('expedier.arrivalStep.delivery.manual.title')}:</Label>
              <Select
                onValueChange={(value) => {
                  const numValue = Number(value);
                  setDepartManutention(numValue);
                  setValue('depart', {
                    ...departValues,
                    manutention: numValue
                  } as ShippingDetails);
                }}
                value={String(departManutention)}
              >
                <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <SelectValue placeholder={t('expedier.arrivalStep.delivery.manual.title')} />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <SelectItem value="0">{t('expedier.arrivalStep.delivery.manual.vehicleSide')}</SelectItem>
                  <SelectItem value="1">{t('expedier.arrivalStep.delivery.manual.onePerson')}</SelectItem>
                  <SelectItem value="2">{t('expedier.arrivalStep.delivery.manual.twoPerson')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        {departManutention > 0 && (
          <div className="grid md:grid-cols-2 gap-x-4 gap-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="depart.elevator"
                checked={Boolean(departValues?.elevator)}
                onCheckedChange={(checked) => {
                  setValue('depart', {
                    ...departValues,
                    elevator: checked
                  });
                }}
              />
              <Label htmlFor="depart.elevator">{t('expedier.arrivalStep.delivery.elevator')}</Label>
            </div>
            <div>
              <Label htmlFor="depart.floor">{t('expedier.arrivalStep.delivery.floor')}:</Label>
              <Input
                type="number"
                className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                {...register('depart.floor')}
                min={0}
                value={departValues?.floor || 0}
                onChange={(e) => setValue('depart.floor', Number(e.target.value))}
              />
            </div>
          </div>
        )}
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('expedier.arrivalStep.form.contactPerson')}
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-x-4 gap-y-2">
          <div>
            <Label htmlFor="depart.full_name">{t('expedier.arrivalStep.form.fullName')} <span className="text-red-600">*</span>:</Label>
            <Input
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              id="depart.full_name"
              {...register('depart.full_name', { required: t('expedier.arrivalStep.validation.name') })}
              value={departValues?.full_name || ''}
              onChange={(e) => setValue('depart.full_name', e.target.value)}
            />
            {errorsTyped.depart?.full_name && (
              <p className="text-sm font-medium text-red-600">
                {errorsTyped.depart?.full_name.message}
              </p>
            )}
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-x-4 gap-y-2">
          {DeparturePhoneInput}
          <div>
            <Label htmlFor="depart.email">{t('expedier.arrivalStep.form.email')} <span className="text-red-600">*</span>:</Label>
            <Input
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              id="depart.email"
              type='email'
              {...register('depart.email', {
                required: t('expedier.arrivalStep.validation.email'),
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: t('expedier.arrivalStep.validation.invalidEmail')
                }
              })}
              value={departValues?.email || ''}
              onChange={(e) => setValue('depart.email', e.target.value)}
            />
            {errorsTyped.depart?.email && (
              <p className="text-sm font-medium text-red-600">
                {errorsTyped.depart?.email.message}
              </p>
            )}
          </div>
        </div>
        <div>
          <Label htmlFor="depart.locationTypeId">{t('expedier.arrivalStep.form.addressType')} <span className="text-red-500">*</span>
          </Label>
          <Select
            onValueChange={(value) => setValue('depart.location_type', {
              id: Number(value),
              name: locationTypes.find((type: LocationType) => type.id === Number(value))?.name || ''
            })}
            value={String(departValues?.location_type?.id || '')}
            required
          >
            <SelectTrigger className={`bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${errorsTyped.depart?.locationTypeId ? 'border-red-500' : ''}`}>
              <SelectValue placeholder={t('expedier.arrivalStep.select.pickupLocation')} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              {locationTypes
                .slice()
                .sort((a: { id: number; name: string }, b: { id: number; name: string }) => a.id - b.id)
                .map((type: { id: number; name: string }) => (
                  <SelectItem key={type.id} value={String(type.id)}>
                    {t(`expedier.arrivalStep.locationTypes.${type.id}`)}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {errorsTyped.depart?.locationTypeId && (
            <p className="text-sm font-medium text-red-600">
              {errorsTyped.depart.locationTypeId.message}
            </p>
          )}
        </div>
        {/* Switch to toggle map visibility */}
        <div className="flex flex-col gap-3 mt-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-teal-400/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300" />
            <div className="relative flex items-center gap-4 p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-100 dark:border-gray-700/50 hover:border-teal-200 dark:hover:border-teal-500/30 transition-all duration-300">
              <Switch
                id="hasExactDepartureLocation"
                checked={hasExactDepartureLocation}
                onCheckedChange={(e) => setHasExacDeparturetLocation(e)}
              />
              <div className="space-y-1">
                <Label htmlFor="hasExactDepartureLocation" className="text-base font-medium">
                  {t('expedier.arrivalStep.form.locationMap')}
                </Label>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <MapPin className="h-4 w-4 text-teal-500" />
                  <span>{t('expedier.arrivalStep.form.mapInfo')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DraggableMap Component with initial coordinates */}
        {memoizedDepartureMap}
      </div>
      <div className="flex flex-col gap-2">
        <div>
          <h2 className="font-semibold">{t('expedier.arrivalStep.title.destinationAddress')}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('expedier.arrivalStep.subtitle.destination')}
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-x-4 gap-y-2">
          <div>
            <Label htmlFor="pays">{t('expedier.arrivalStep.form.country')} : <span className="text-red-500">*</span></Label>
            <Select
              onValueChange={handleDestinationCountryChange}
              value={selectedDestinationCountryId}
            >
              <SelectTrigger className={`bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${errors.destination?.countryId ? 'border-red-500 focus:ring-red-500' : ''}`}
                ref={destinationCountrySelectRef}
              >
                <SelectValue placeholder={t('expedier.arrivalStep.select.country')} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                {[...countries].sort(sortByName).map((country: Country) => (
                  <SelectItem key={country.id} value={String(country.id)}>
                    {getCountryName(country)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.destination?.countryId && (
              <p className="text-sm font-medium text-red-600">
                {t('expedier.arrivalStep.validation.country')}
              </p>
            )}
            <SelectHelper 
              message={t('expedier.arrivalStep.select.countryFirst')} 
              visible={!selectedDestinationCountryId}
            />
          </div>
          <div>
            <Label htmlFor="destination.cityId">{t('expedier.arrivalStep.form.city')} : <span className="text-red-500">*</span></Label>
            <Select
              onValueChange={handleSelectDestinationCity}
              value={String(destinationValues?.cityId || '')}
              disabled={!selectedDestinationCountryId}
              onOpenChange={handleDestinationOpenChange}
            >
              <SelectTrigger 
                className={`bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${
                  errorsTyped.destination?.cityId ? 'border-red-500 focus:ring-red-500' : ''
                } ${
                  !selectedDestinationCountryId ? 'opacity-70 cursor-not-allowed' : ''
                }`}
                ref={destinationCitySelectRef}
              >
                <SelectValue placeholder={
                  !selectedDestinationCountryId 
                    ? t('expedier.arrivalStep.select.countryFirst')
                    : t('expedier.arrivalStep.select.city')
                } />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                {selectedDestinationCountryId && (
                  <div 
                    className="flex items-center px-3 py-2 sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
                    onClick={(e) => {
                      // Prevent click from closing the dropdown
                      e.stopPropagation();
                    }}
                  >
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <input
                      // Using a native input instead of the Input component for better focus control
                      ref={destinationSearchRef}
                      placeholder={t('expedier.arrivalStep.select.searchCity')}
                      value={destinationCitySearch}
                      onChange={(e) => setDestinationCitySearch(e.target.value)}
                      className="h-11 w-full border-none bg-transparent p-0 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      onKeyDown={handleSearchKeyDown}
                      onFocus={() => setDestinationSearchFocused(true)}
                      onBlur={() => setDestinationSearchFocused(false)}
                      // Prevent click from bubbling to parent components
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      autoComplete="off"
                    />
                  </div>
                )}
                {selectedDestinationCountryId && filteredDestinationCities.length ? (
                  filteredDestinationCities.map((city: { id: number; name: string }) => (
                    <SelectItem key={city.id} value={String(city.id)}>
                      {city.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="text-center py-2 text-sm text-gray-500">
                    {selectedDestinationCountryId 
                      ? destinationCitySearch 
                        ? t('expedier.arrivalStep.departure.noCityFound') 
                        : t('expedier.arrivalStep.select.noCity') 
                      : t('expedier.arrivalStep.select.countryFirst')}
                  </div>
                )}
              </SelectContent>
            </Select>
            {errorsTyped.destination?.cityId && (
              <p className="text-sm font-medium text-red-600">{t('expedier.arrivalStep.validation.city')}</p>
            )}
            {selectedDestinationCountryId && !selectedDestinationCountryData?.cities?.length && (
              <SelectHelper message={t('expedier.arrivalStep.select.noCity')} />
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-x-4 gap-y-2">
          <div className="col-span-2">
            <Label htmlFor="destination_adresse">{t('expedier.arrivalStep.form.address')} : <span className="text-red-500">*</span>
            </Label>
            <Input
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              id="destination_adresse"
              {...register('destination.adresse', { required: t('expedier.arrivalStep.validation.address') })}
              value={destinationValues?.adresse || ''}
              onChange={(e) => setValue('destination.adresse', e.target.value)}
            />
            {errorsTyped.destination?.adresse && (
              <p className="text-sm font-medium text-red-600">
                {errorsTyped.destination?.adresse.message}
              </p>
            )}
          </div>

          {formShipmentType?.id !== 1 && (
            <div>
              <Label htmlFor="manutention">{t('expedier.arrivalStep.delivery.manual.title')}:</Label>
              <Select
                onValueChange={(value) => {
                  const numValue = Number(value);
                  setDestinationManutention(numValue);
                  setValue('destination', {
                    ...destinationValues,
                    manutention: numValue
                  } as ShippingDetails);
                }}
                value={String(destinationManutention)}
              >
                <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <SelectValue placeholder={t('expedier.arrivalStep.delivery.manual.title')} />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <SelectItem value="0">{t('expedier.arrivalStep.delivery.manual.vehicleSide')}</SelectItem>
                  <SelectItem value="1">{t('expedier.arrivalStep.delivery.manual.onePerson')}</SelectItem>
                  <SelectItem value="2">{t('expedier.arrivalStep.delivery.manual.twoPerson')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        {destinationManutention > 0 && (
          <div className="grid md:grid-cols-2 gap-x-4 gap-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="destination.elevator"
                checked={Boolean(destinationValues?.elevator)}
                onCheckedChange={(checked) => {
                  setValue('destination', {
                    ...destinationValues,
                    elevator: checked
                  });
                }}
              />
              <Label htmlFor="destination.elevator">{t('expedier.arrivalStep.delivery.elevator')}</Label>
            </div>
            <div>
              <Label htmlFor="destination.floor">{t('expedier.arrivalStep.delivery.floor')}:</Label>
              <Input
                type="number"
                className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                {...register('destination.floor')}
                min={0}
                value={destinationValues?.floor || 0}
                onChange={(e) => setValue('destination.floor', Number(e.target.value))}
              />
            </div>
          </div>
        )}
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('expedier.arrivalStep.form.contactPerson')}
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-x-4 gap-y-2">
          <div>
            <Label htmlFor="destination_full_name">{t('expedier.arrivalStep.form.fullName')} <span className="text-red-600">*</span>:</Label>
            <Input
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              id="destination_full_name"
              {...register('destination.full_name', { required: t('expedier.arrivalStep.validation.name') })}
              value={destinationValues?.full_name || ''}
              onChange={(e) => setValue('destination.full_name', e.target.value)}
            />
            {errorsTyped.destination?.full_name && (
              <p className="text-sm font-medium text-red-600">
                {errorsTyped.destination?.full_name.message}
              </p>
            )}
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-x-4 gap-y-2">
          {DestinationPhoneInput}
          <div>
            <Label htmlFor="destination_email">{t('expedier.arrivalStep.form.email')} <span className="text-red-600">*</span>:</Label>
            <Input
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              id="destination_email"
              type='email'
              {...register('destination.email', {
                required: t('expedier.arrivalStep.validation.email'),
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: t('expedier.arrivalStep.validation.invalidEmail')
                }
              })}
              value={destinationValues?.email || ''}
              onChange={(e) => setValue('destination.email', e.target.value)}
            />
            {errorsTyped.destination?.email && (
              <p className="text-sm font-medium text-red-600">
                {errorsTyped.destination?.email?.message || "L'email est requis"}
              </p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="destination_contact_type">{t('expedier.arrivalStep.form.addressType')} <span className="text-red-500">*</span>
          </Label>
          <Select
            onValueChange={(value) => setValue('destination.location_type', {
              id: Number(value),
              name: locationTypes.find((type: LocationType) => type.id === Number(value))?.name || ''
            })}
            value={String(destinationValues?.location_type?.id || '')}
            required
          >
            <SelectTrigger className={`bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${errorsTyped.destination?.locationTypeId ? 'border-red-500' : ''}`}>
              <SelectValue placeholder={t('expedier.arrivalStep.select.pickupLocation')} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              {locationTypes
                .slice()
                .sort((a: { id: number; name: string }, b: { id: number; name: string }) => a.id - b.id)
                .map((type: { id: number; name: string }) => (
                  <SelectItem key={type.id} value={String(type.id)}>
                    {t(`expedier.arrivalStep.locationTypes.${type.id}`)}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {errorsTyped.destination?.locationTypeId && (
            <p className="text-sm font-medium text-red-600">
              {errorsTyped.destination.locationTypeId.message}
            </p>
          )}
        </div>

        {/* Switch to toggle map visibility */}
        <div className="flex flex-col gap-3 mt-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-teal-400/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300" />
            <div className="relative flex items-center gap-4 p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-100 dark:border-gray-700/50 hover:border-teal-200 dark:hover:border-teal-500/30 transition-all duration-300">
              <Switch
                id="hasExactDestinationLocation"
                checked={hasExactDestinationLocation}
                onCheckedChange={(e) => setHasExactDestinationLocation(e)}
              />
              <div className="space-y-1">
                <Label htmlFor="hasExactDestinationLocation" className="text-base font-medium">
                  {t('expedier.arrivalStep.form.locationMap')}
                </Label>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <MapPin className="h-4 w-4 text-teal-500" />
                  <span>{t('expedier.arrivalStep.form.mapInfo')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DraggableMap Component with initial coordinates */}
        {memoizedDestinationMap}
      </div>
    </div>
  );
}
