"use client";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Stepper from "@/components/Stepper"; // Your custom stepper component
import { BusinessSchema, BusinessFormValues } from "./schema";
import { Step1Service } from "./steps/Step1Service";
import { Step2Contact } from "./steps/Step2Contact";
import { Step3Manager } from "./steps/Step3Manager";
import { Step4Upload } from "./steps/Step4Upload";
import { Step5Recap } from "./steps/Step5Recap";

import { createBusiness, uploadFile } from "@/api/businesses-api";
import { createMember } from "@/api/members-api";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

export default function AddBusinessPage() {
    const methods = useForm<BusinessFormValues>({
        resolver: zodResolver(BusinessSchema),
        defaultValues: { managementType: "ownerId" }
    });

    const steps = [
        { step: 1, label: "Service", content: Step1Service },
        { step: 2, label: "Contact", content: Step2Contact },
        { step: 3, label: "Manager", content: Step3Manager },
        { step: 4, label: "Media", content: Step4Upload },
        { step: 5, label: "Recap", content: Step5Recap },
    ];

    const handleFinalSubmit = async (data: any) => {
        const MySwal = withReactContent(Swal);

        try {
            // 1. Show Loading
            MySwal.fire({
                title: 'Saving...',
                text: 'Uploading media files and preparing payload',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading(); }
            });

            // Helper to upload a file from FileList
            const upload = async (fileList: any) => {
                if (fileList && fileList.length > 0) {
                    const res = await uploadFile(fileList[0]);
                    return { id: res.id || res.data?.id };
                }
                return null;
            };

            const flyerId = await upload(data.flyer);
            const audioArId = await upload(data.audioAr);
            const audioEnId = await upload(data.audioEn);
            const audioFrId = await upload(data.audioFr);
            const videoArId = await upload(data.videoAr);
            const videoEnId = await upload(data.videoEn);
            const videoFrId = await upload(data.videoFr);

            let managerId = data.ownerId;
            if (data.managementType === "newManagedId") {
                const memberPayload = {
                    typeMember: 'INDIVIDUAL',
                    user: { email: data.newManagerEmail },
                    contact: {
                        firstName: data.newManagerFirstName,
                        lastName: data.newManagerLastName,
                        firstNameAr: data.newManagerFirstNameAr,
                        lastNameAr: data.newManagerLastNameAr,
                        email: data.newManagerEmail,
                        phoneCell: String(data.newManagerPhone),
                    }
                };
                const newMemberRes = await createMember(memberPayload);
                managerId = newMemberRes.id || newMemberRes.data?.id;
            }

            // 2. Format Payload
            const payload = {
                nameFr: data.nameFr,
                nameAr: data.nameAr,
                nameEn: data.nameEn,
                descrFr: data.descrFr,
                descrAr: data.descrAr,
                descrEn: data.descrEn,
                businessUrlSite: data.siteUrl || data.businessUrlSite || "",
                socialMedia: data.socialMedia || "",

                // Relations (Ensuring objects with IDs)
                service: data.serviceId ? { id: data.serviceId } : null,
                owner: { id: data.ownerId },
                contact: { id: data.contactId },

                manager: { id: managerId },

                localisation: data.manualLatitude && data.manualLongitude ? {
                    latitude: parseFloat(data.manualLatitude),
                    longitude: parseFloat(data.manualLongitude)
                } : undefined,

                flyer: flyerId,
                audioAr: audioArId,
                audioEn: audioEnId,
                audioFr: audioFrId,
                videoAr: videoArId,
                videoEn: videoEnId,
                videoFr: videoFrId,
            };

            // 3. Client-side Validation Check
            if (!payload.contact.id || !payload.owner.id) {
                MySwal.fire({
                    icon: 'warning',
                    title: 'Missing Selection',
                    text: 'Please ensure you selected a Contact and an Owner.'
                });
                return;
            }

            // 4. API Call
            await createBusiness(payload as any);

            // 5. Success UI
            await MySwal.fire({
                icon: 'success',
                title: 'Created!',
                text: 'Business added successfully with media files.',
                timer: 2000,
                showConfirmButton: false
            });

            // 6. Cleanup
            methods.reset(); // Clear the form

        } catch (error: any) {
            console.error("API Error:", error);
            const errorMessage = error.response?.data?.message || "An unexpected error occurred.";

            MySwal.fire({
                icon: 'error',
                title: 'Database Error',
                text: errorMessage
            });
        }
    };

    return (
        <div className="p-8">
            <FormProvider {...methods}>
                <Stepper
                    steps={steps}
                    onSubmit={async () => methods.handleSubmit(handleFinalSubmit)()}
                />
            </FormProvider>
        </div>
    );
}