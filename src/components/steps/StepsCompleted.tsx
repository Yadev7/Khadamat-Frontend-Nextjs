import Image from 'next/image';
import { Button } from '../button';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

export function StepsCompleted() {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <div className="flex justify-center items-center w-full my-10">
      <div className="flex flex-col items-center gap-4 max-w-[450px] text-center">
        <Image src={'/formSubmittedSuccess.svg'} alt="" width={200} height={200} />
        <h1 className="text-2xl font-semibold">{t('expedier.steps.publishSuccess.title')}</h1>
        <p className="text-slate-500">
          {t('expedier.steps.publishSuccess.message')}
        </p>
        <Button
            className="w-[120px] min-h-[44px] touch-manipulation"
            type="button"
            onClick={()=>router.push('/annonces')}
          >
            {t('nav.annonces')}
          </Button>
      </div>
    </div>
  );
}
