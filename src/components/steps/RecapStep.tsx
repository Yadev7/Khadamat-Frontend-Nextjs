import { useFormContext } from 'react-hook-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import Image from 'next/image';
import {
  Package, Truck, Users, MapPin, Calendar, Eye, Box,
  Phone, Mail, Building, Briefcase, MapPinned, Ruler,
  Weight, AlertTriangle, Hash, DollarSign, Globe,
  ArrowUpDown, AlertCircle, Compass, Home, Euro,
  CalendarClock, HandCoins, Receipt, Wallet, ArrowRight,
  CheckCircle2, Info, Layers, ShieldCheck
} from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import React from 'react';


interface ShipmentType {
  id: number;
  name: string;
}

interface LocationType {
  id: number;
  name: string;
}

// Modern InfoItem component with icon support
const InfoItem = ({ label, value, icon: Icon }: { label: string; value: any; icon?: any }) => (
  <div className="flex items-start gap-4 p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all border border-gray-100 dark:border-gray-800">
    {Icon && (
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 shrink-0">
        <Icon className="h-5 w-5" />
      </div>
    )}
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 font-medium text-gray-900 dark:text-gray-100 break-words">{value || '-'}</p>
    </div>
  </div>
);

// ─── Price Breakdown Card ────────────────────────────────────────────
const PriceBreakdownCard = ({
  initialPrice,
  departManutention,
  destinationManutention,
  totalManutentionCost,
  propositionPrice,
  t,
}: {
  initialPrice: number;
  departManutention: number;
  destinationManutention: number;
  totalManutentionCost: number;
  propositionPrice: number;
  t: (key: string, options?: any) => string;
}) => {
  const hasManutention = totalManutentionCost > 0;

  return (
    <Card className="border-0 ring-1 ring-gray-200 dark:ring-gray-800 bg-white dark:bg-gray-900 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3 bg-gray-50/50 dark:bg-gray-800/50">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
          <Receipt className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            {t('recapStep.pricing.title')}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('recapStep.pricing.subtitle')}
          </p>
        </div>
      </div>

      <CardContent className="p-6 space-y-5">
        {/* Line items */}
        <div className="space-y-3">
          {/* Base price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600">
                <Wallet className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('recapStep.pricing.basePrice')}
                </p>
              </div>
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">
              {initialPrice} €
            </span>
          </div>

          {/* Manutention lines (only if there is any) */}
          {hasManutention && (
            <>
              {departManutention > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-600">
                      <HandCoins className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('recapStep.pricing.departHandling')}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {t('recapStep.pricing.handlingPersons', { count: departManutention })}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                    +{departManutention * 29} €
                  </span>
                </div>
              )}

              {destinationManutention > 0 && (
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-600">
                      <HandCoins className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('recapStep.pricing.destHandling')}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {t('recapStep.pricing.handlingPersons', { count: destinationManutention })}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                    +{destinationManutention * 29} €
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-gray-200 dark:border-gray-700" />

        {/* Total */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-gray-900 dark:text-white uppercase">
                {t('recapStep.pricing.total')}
            </p>
          </div>
          <span className="text-xl font-extrabold text-teal-600 dark:text-teal-400 tabular-nums">
            {propositionPrice} €
          </span>
        </div>

        {/* Info hint */}
        {hasManutention && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <Info className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              {t('recapStep.pricing.handlingExplanation')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export function RecapStep() {
  const { getValues } = useFormContext();
  const { t, i18n } = useTranslation();
  const formValues = getValues();
  const { shipmentTypes, locationTypes } = useSelector((state: RootState) => state.website);

  const normalizeLanguage = (lang?: string): 'fr' | 'en' | 'ar' => {
    if (!lang) return 'fr';
    const code = lang.toLowerCase();
    if (code.startsWith('en')) return 'en';
    if (code.startsWith('ar')) return 'ar';
    return 'fr';
  };

  const getLocalizedValue = (
    frValue?: string,
    enValue?: string,
    arValue?: string
  ) => {
    const selectedLanguage = normalizeLanguage(i18n.resolvedLanguage || i18n.language);

    const values = {
      fr: frValue?.trim(),
      en: enValue?.trim(),
      ar: arValue?.trim(),
    };

    // Keep display to one language only. Fallback remains single-value.
    return values[selectedLanguage] || values.fr || values.en || values.ar || '-';
  };

  const announcementTitle = getLocalizedValue(
    formValues.title,
    formValues.titleEn,
    formValues.titleAr
  );

  // Get shipment type ID
  const shipmentTypeId = formValues.shipment_type?.id || formValues.shipmentTypeId;
  
  // Use ID to get translation
  const shipmentType = shipmentTypeId 
    ? t(`recapStep.shipmentTypes.${shipmentTypeId}`)
    : 'N/A';
    
  // Get visibility and frequency IDs
  const visibilityId = formValues.visibility?.id;
  const frequencyId = formValues.frequency?.id;
  const carrierTypeId = formValues.carrierType?.id;
  
  // Use IDs to get translations
  const visibilityValue = visibilityId 
    ? t(`recapStep.visibility.${visibilityId}`)
    : '-';
    
  const frequencyValue = frequencyId
    ? t(`recapStep.frequency.${frequencyId}`)
    : '-';
    
  const carrierTypeValue = carrierTypeId
    ? t(`recapStep.carrierTypes.${carrierTypeId}`)
    : '-';
  
  // Use location type ID to get the translations
  const departLocationTypeId = formValues.depart?.location_type?.id;
  const destinationLocationTypeId = formValues.destination?.location_type?.id;
  
  const departLocationType = departLocationTypeId 
    ? t(`expedier.arrivalStep.locationTypes.${departLocationTypeId}`) 
    : '';
    
  const destinationLocationType = destinationLocationTypeId
    ? t(`expedier.arrivalStep.locationTypes.${destinationLocationTypeId}`)
    : '';

  // Price calculations
  const initialPrice = formValues.initialPrice ?? formValues.propositionPrice ?? 0;
  const departManutention = formValues.depart?.manutention ?? 0;
  const destinationManutention = formValues.destination?.manutention ?? 0;
  const totalManutentionCost = (departManutention + destinationManutention) * 29;
  const propositionPrice = formValues.propositionPrice ?? initialPrice + totalManutentionCost;

  const packageImageData = React.useMemo(() => {
    const objectUrlsToRevoke: string[] = [];
    const urlsByPackage = (formValues.packages || []).map((pkg: any) => {
      if (!Array.isArray(pkg?.images)) return [];

      return pkg.images
        .map((image: any) => {
          if (typeof image === 'string') return image;
          if (image instanceof File) {
            const url = URL.createObjectURL(image);
            objectUrlsToRevoke.push(url);
            return url;
          }
          if (image?.path) return image.path;
          return '';
        })
        .filter(Boolean);
    });

    return { urlsByPackage, objectUrlsToRevoke };
  }, [formValues.packages]);

  React.useEffect(() => {
    return () => {
      packageImageData.objectUrlsToRevoke.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [packageImageData]);

  // Quick summary badges at the top
  const packageCount = formValues.packages?.length ?? 0;
  const totalWeight = formValues.packages?.reduce((sum: number, pkg: any) => sum + (pkg.weight || 0) * (pkg.quantity || 1), 0) ?? 0;

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      
      {/* ─── Top Alert ──────────────────────────────────────── */}
      <Alert className="border-teal-200 bg-teal-50/50 text-teal-800 dark:border-teal-800 dark:bg-teal-900/20 dark:text-teal-200">
        <CheckCircle2 className="h-4 w-4" />
        <AlertDescription className="text-sm font-medium">
          {t('recapStep.verifyAnnouncement')}
        </AlertDescription>
      </Alert>

      {/* ─── Quick Summary Strip ────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
          <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t('recapStep.summary.packages')}</span>
          <div className="flex items-center gap-2">
              <Box className="h-4 w-4 text-blue-500" />
              <span className="text-lg font-bold text-gray-900">{packageCount}</span>
          </div>
          </div>
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
          <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t('recapStep.summary.totalWeight')}</span>
          <div className="flex items-center gap-2">
              <Weight className="h-4 w-4 text-purple-500" />
              <span className="text-lg font-bold text-gray-900">{totalWeight} <span className="text-sm font-normal text-gray-400">kg</span></span>
          </div>
          </div>
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
          <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t('recapStep.summary.transport')}</span>
          <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-emerald-500 shrink-0" />
              <span className="text-lg font-bold text-gray-900 text-center leading-none">{shipmentType}</span>
          </div>
          </div>
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
              <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t('recapStep.summary.totalPrice')}</span>
              <div className="flex items-center gap-2">
                  <Euro className="h-4 w-4 text-teal-500" />
                  <span className="text-lg font-bold text-teal-600">{propositionPrice}</span>
              </div>
          </div>
      </div>

      {/* ─── Detailed Tabs ──────────────────────────────────── */}
      <Tabs defaultValue="general" className="w-full">
          <TabsList className="w-full grid w-full grid-cols-4 h-12 rounded-xl bg-gray-100/50 dark:bg-gray-800/50 p-1">
                <TabsTrigger value="general" className="min-h-[44px] rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <span className="hidden sm:inline">{t('recapStep.sections.general.title')}</span>
                  <Package className="h-4 w-4 sm:hidden" />
              </TabsTrigger>
                <TabsTrigger value="packages" className="min-h-[44px] rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <span className="hidden sm:inline">{t('recapStep.sections.packages.title')}</span>
                  <Box className="h-4 w-4 sm:hidden" />
              </TabsTrigger>
                <TabsTrigger value="departure" className="min-h-[44px] rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <span className="hidden sm:inline">{t('recapStep.sections.departure.title')}</span>
                  <MapPin className="h-4 w-4 sm:hidden" />
              </TabsTrigger>
                <TabsTrigger value="destination" className="min-h-[44px] rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <span className="hidden sm:inline">{t('recapStep.sections.destination.title')}</span>
                  <MapPin className="h-4 w-4 sm:hidden" />
              </TabsTrigger>
          </TabsList>

          <div className="mt-6 space-y-6">
          <TabsContent value="general">
              <Card className="border-0 shadow-none">
              <CardContent className="grid gap-4 p-0 sm:grid-cols-2">
                <InfoItem label={t('recapStep.sections.general.fields.title')} value={announcementTitle} icon={Package} />
                  <InfoItem label={t('recapStep.sections.general.fields.expeditionType')} value={shipmentType} icon={Box} />
                  {shipmentTypeId === 2 && (
                  <InfoItem
                      label={t('recapStep.sections.general.fields.vehicleType')}
                      value={formValues.subShipmentType?.id ? t(`transporter.steps.terrestrialTransportInfo.vehicleType.${getVehicleTypeKey(formValues.subShipmentType.id)}`) : '-'}
                      icon={Truck}
                  />
                  )}
                  <InfoItem
                  label={t('recapStep.sections.general.fields.carrierType')}
                  value={carrierTypeValue}
                  icon={Users}
                  />
                  <InfoItem
                  label={t('recapStep.sections.general.fields.visibility')}
                  value={visibilityValue}
                  icon={Eye}
                  />
                  <InfoItem
                  label={t('recapStep.sections.general.fields.shippingFrequency')}
                  value={frequencyValue}
                  icon={CalendarClock}
                  />
                  <InfoItem
                  label={t('recapStep.sections.general.fields.startDate')}
                  value={formValues.startDate ? format(new Date(formValues.startDate), 'dd/MM/yyyy') : '-'}
                  icon={Calendar}
                  />
                  <InfoItem
                  label={t('recapStep.sections.general.fields.endDate')}
                  value={formValues.endDate ? format(new Date(formValues.endDate), 'dd/MM/yyyy') : '-'}
                  icon={Calendar}
                  />
                  <InfoItem
                  label={t('recapStep.sections.general.fields.publishDate')}
                  value={formValues.publishDate ? format(new Date(formValues.publishDate), 'dd/MM/yyyy') : '-'}
                  icon={Calendar}
                  />
                  <InfoItem label={t('recapStep.sections.general.fields.totalPackageValue')} value={`${formValues.valueSum} €`} icon={DollarSign} />
              </CardContent>
              </Card>
          </TabsContent>

          <TabsContent value="packages">
              <Card className="border-0 shadow-none">
              <CardContent className="space-y-4 p-0">
                  {formValues.packages.map((pkg: any, index: number) => (
                  <div key={index} className="space-y-4 p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
                      <h3 className="text-sm font-bold uppercase text-gray-400 flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      {t('recapStep.sections.packages.title')} {index + 1}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InfoItem
                        label={t('recapStep.sections.packages.fields.title')}
                        value={getLocalizedValue(pkg.title, pkg.titleEn, pkg.titleAr)}
                        icon={Ruler}
                      />
                      <InfoItem
                        label={t('recapStep.sections.packages.fields.description')}
                        value={getLocalizedValue(pkg.content, pkg.contentEn, pkg.contentAr)}
                        icon={Package}
                      />
                      <InfoItem label={t('recapStep.sections.packages.fields.dimensions')} value={`${pkg.dimensions.length}x${pkg.dimensions.width}x${pkg.dimensions.height}cm`} icon={Ruler} />
                      <InfoItem label={t('recapStep.sections.packages.fields.weight')} value={`${pkg.weight} kg`} icon={Weight} />
                      <InfoItem label={t('recapStep.sections.packages.fields.fragile')} value={pkg.fragile ? t('recapStep.yes') : t('recapStep.no')} icon={AlertTriangle} />
                      <InfoItem label={t('recapStep.sections.packages.fields.quantity')} value={pkg.quantity} icon={Hash} />
                      <InfoItem label={t('recapStep.sections.packages.fields.value')} value={`${pkg.value} €`} icon={DollarSign} />
                      </div>
                      {pkg.images && pkg.images.length > 0 ? (
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                          {(packageImageData.urlsByPackage[index] || []).map((url: string, imgIndex: number) => (
                          <div key={imgIndex} className="relative group rounded-lg overflow-hidden aspect-square bg-gray-100">
                              <Image
                              src={url}
                              alt={`${t('recapStep.sections.packages.title')} ${index + 1} - ${t('recapStep.sections.packages.fields.image')} ${imgIndex + 1}`}
                              fill
                              className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                              />
                          </div>
                          ))}
                      </div>
                      ) : null}
                  </div>
                  ))}
              </CardContent>
              </Card>
          </TabsContent>

          <TabsContent value="departure">
              <Card className="border-0 shadow-none">
              <CardContent className="grid gap-4 p-0 sm:grid-cols-2">
                  <InfoItem label={t('recapStep.sections.departure.fields.fullName')} value={formValues.depart.full_name} icon={Users} />
                  <InfoItem label={t('recapStep.sections.departure.fields.email')} value={formValues.depart.email} icon={Mail} />
                  <InfoItem label={t('recapStep.sections.departure.fields.phone')} value={formValues.depart.phoneNumber} icon={Phone} />
                  <InfoItem label={t('recapStep.sections.departure.fields.address')} value={formValues.depart.adresse} icon={MapPinned} />
                  <InfoItem label={t('recapStep.sections.departure.fields.locationType')} value={departLocationType} icon={Building} />
                  <InfoItem 
                  label={t('recapStep.sections.departure.fields.handling')}
                  value={formValues.depart.manutention 
                      ? t('recapStep.sections.departure.fields.handlingDetails', {count: formValues.depart.manutention, cost: formValues.depart.manutention * 29})
                      : t('recapStep.sections.departure.fields.noHandling')
                  }
                  icon={HandCoins}
                  />
                  {formValues.depart.manutention > 0 && (
                  <>
                      <InfoItem 
                      label={t('recapStep.sections.departure.fields.elevator')} 
                      value={formValues.depart.elevator ? t('recapStep.yes') : t('recapStep.no')} 
                      icon={ArrowUpDown} 
                      />
                      <InfoItem 
                      label={t('recapStep.sections.departure.fields.floor')} 
                      value={formValues.depart.floor} 
                      icon={Building} 
                      />
                  </>
                  )}
              </CardContent>
              </Card>
          </TabsContent>

          <TabsContent value="destination">
              <Card className="border-0 shadow-none">
              <CardContent className="grid gap-4 p-0 sm:grid-cols-2">
                  <InfoItem label={t('recapStep.sections.destination.fields.fullName')} value={formValues.destination.full_name} icon={Users} />
                  <InfoItem label={t('recapStep.sections.destination.fields.email')} value={formValues.destination.email} icon={Mail} />
                  <InfoItem label={t('recapStep.sections.destination.fields.phone')} value={formValues.destination.phoneNumber} icon={Phone} />
                  <InfoItem label={t('recapStep.sections.destination.fields.address')} value={formValues.destination.adresse} icon={MapPinned} />
                  <InfoItem label={t('recapStep.sections.destination.fields.locationType')} value={destinationLocationType} icon={Building} />
                  <InfoItem 
                  label={t('recapStep.sections.destination.fields.handling')}
                  value={formValues.destination.manutention 
                      ? t('recapStep.sections.destination.fields.handlingDetails', {count: formValues.destination.manutention, cost: formValues.destination.manutention * 29})
                      : t('recapStep.sections.destination.fields.noHandling')
                  }
                  icon={HandCoins}
                  />
                  {formValues.destination.manutention > 0 && (
                  <>
                      <InfoItem 
                      label={t('recapStep.sections.destination.fields.elevator')} 
                      value={formValues.destination.elevator ? t('recapStep.yes') : t('recapStep.no')} 
                      icon={ArrowUpDown} 
                      />
                      <InfoItem 
                      label={t('recapStep.sections.destination.fields.floor')} 
                      value={formValues.destination.floor} 
                      icon={Building} 
                      />
                  </>
                  )}
              </CardContent>
              </Card>
          </TabsContent>
          </div>
      </Tabs>

        {/* ─── Price Breakdown ────────────────────────────────── */}
        <div className="w-full max-w-2xl mx-auto">
            <PriceBreakdownCard
                initialPrice={initialPrice}
                departManutention={departManutention}
                destinationManutention={destinationManutention}
                totalManutentionCost={totalManutentionCost}
                propositionPrice={propositionPrice}
                t={t}
            />
        </div>

    </div>
  );
}

// Helper function to map vehicle type id to translation key
function getVehicleTypeKey(id: number) {
  switch (id) {
    case 1: return 'car';
    case 2: return 'van';
    case 3: return 'truck';
    case 4: return 'bus';
    case 5: return 'train';
    default: return '';
  }
}
