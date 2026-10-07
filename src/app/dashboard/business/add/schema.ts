import { z } from "zod";

export const BusinessSchema = z.object({
    nameEn: z.string().min(1, "Name is required"),
    nameFr: z.string().min(1, "Nom est requis"),
    nameAr: z.string().min(1, "الاسم مطلوب"),
    descrEn: z.string().min(5, "Description too short"),
    descrFr: z.string().min(5, "Description trop courte"),
    descrAr: z.string().min(5, "الوصف قصير جداً"),
    serviceId: z.string().min(1, "Service required"),
    ownerId: z.string().min(1, "Owner required"),
    siteUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
    socialMedia: z.string().optional(),
    contactId: z.string().min(1, "Contact required"),
    managementType: z.enum(["ownerId", "newManagedId"]).default("ownerId"),
    newManagerId: z.string().optional(),
    images: z.any().optional(),
    flyer: z.any().optional(),
    audioAr: z.any().optional(),
    audioEn: z.any().optional(),
    audioFr: z.any().optional(),
    videoAr: z.any().optional(),
    videoEn: z.any().optional(),
    videoFr: z.any().optional(),
    manualLatitude: z.string().optional(),
    manualLongitude: z.string().optional(),
});

export type BusinessFormValues = z.input<typeof BusinessSchema>;
export type BusinessFormOutput = z.output<typeof BusinessSchema>;

export const STEP_FIELDS = {
    0: ["nameEn", "nameFr", "nameAr", "descrEn", "descrFr", "descrAr", "serviceId", "ownerId", "siteUrl", "socialMedia"],
    1: ["contactId"],
    2: ["managementType", "newManagerId"],
    3: ["images", "flyer", "audioAr", "audioEn", "audioFr", "videoAr", "videoEn", "videoFr"],
    4: []
};
