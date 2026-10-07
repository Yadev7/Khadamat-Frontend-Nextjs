import { useFormContext } from "react-hook-form";

interface FileInputProps {
    label: string;
    name: string;
    accept?: string;
    multiple?: boolean;
}

function FileInput({ label, name, accept, multiple }: FileInputProps) {
    const { register } = useFormContext();

    return (
        <div className="flex flex-col gap-1 border p-3 rounded-xl bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <span className="text-xs font-bold text-slate-500 uppercase dark:text-gray-400">{label}</span>
            <input 
                type="file" 
                {...register(name)} 
                accept={accept}
                multiple={multiple}
                className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-950 dark:file:text-indigo-300 dark:hover:file:bg-indigo-900 dark:text-gray-300" 
            />
        </div>
    );
}

export function Step4Upload() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-full font-bold border-b pb-2 dark:text-gray-100 dark:border-gray-800">Images & Flyers</div>
            <FileInput label="Images (Gallery)" name="images" accept="image/*" multiple={true} />
            <FileInput label="Flyer (PDF/JPG)" name="flyer" accept="image/*,application/pdf" />

            <div className="col-span-full font-bold border-b pb-2 mt-4 text-indigo-600 dark:text-indigo-400 dark:border-gray-800">Audio Records</div>
            <FileInput label="Audio Arabic" name="audioAr" accept="audio/*" />
            <FileInput label="Audio English" name="audioEn" accept="audio/*" />
            <FileInput label="Audio French" name="audioFr" accept="audio/*" />

            <div className="col-span-full font-bold border-b pb-2 mt-4 text-rose-600 dark:text-rose-400 dark:border-gray-800">Video Records</div>
            <FileInput label="Video Arabic" name="videoAr" accept="video/*" />
            <FileInput label="Video English" name="videoEn" accept="video/*" />
            <FileInput label="Video French" name="videoFr" accept="video/*" />
        </div>
    );
}