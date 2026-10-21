import { MATERIAL_TYPES, type MaterialType } from "@/constant";
import { qk } from "@/lib/queryKeys";
import type { StorageResponse } from "@/types";
import { materialLabel } from "@/utils/helpers";
import {
    Button,
    CloseButton,
    Dialog,
    Field,
    Input,
    NativeSelect,
    Portal,
    SimpleGrid,
    Text,
    VStack,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useState } from "react";

type EditStorageDialogProps = {
    storage: StorageResponse;
    onClose: () => void;
    onSubmit: (values: Partial<StorageResponse>) => Promise<void>;
};

const EditStorageDialog = ({ storage, onClose, onSubmit }: EditStorageDialogProps) => {
    const [blockName, setBlockName] = useState(storage.blockName);
    const [section, setSection] = useState(storage.section ?? "");
    const [maxWeight, setMaxWeight] = useState(String(storage.maxWeight));
    const [maxVolume, setMaxVolume] = useState(String(storage.maxVolumeCubicMeter));
    const [price, setPrice] = useState(String(storage.pricePerCubicMeter ?? ""));
    const [materialType, setMaterialType] = useState<MaterialType>(storage.materialType);
    const [error, setError] = useState<string | null>(null);

    const weightNumber = Number(maxWeight);
    const volumeNumber = Number(maxVolume);
    const priceNumber = Number(price);
 
    const weightInvalid = maxWeight === "" || !(weightNumber > 0);
    const volumeInvalid = maxVolume === "" || !(volumeNumber > 0);
    const priceInvalid = price === "" || !(priceNumber > 0);
    const canSave = blockName.trim() !== "" && !weightInvalid && !volumeInvalid && !priceInvalid;

    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (values: Partial<StorageResponse>) => onSubmit(values),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: qk.storagesAll }),
                queryClient.invalidateQueries({ queryKey: qk.warehousesAll}),
            ]);
            onClose();
        },
        onError: (e: AxiosError<{ message?: string }>) => {
            setError(e.response?.data?.message ?? "Failed to save changes");
        },
    });
    
    const handleClose = () => {
        if (mutation.isPending) return;
        onClose();
    };


    const handleSubmit = () => {
        if (!canSave) return;

        const values: Partial<StorageResponse> = {};
        if (blockName.trim() !== storage.blockName) values.blockName = blockName.trim();
        if (section.trim() !== (storage.section ?? "")) values.section = section.trim();
        if (weightNumber !== storage.maxWeight) values.maxWeight = weightNumber;
        if (volumeNumber !== storage.maxVolumeCubicMeter) values.maxVolumeCubicMeter = volumeNumber;
        if (priceNumber !== Number(storage.pricePerCubicMeter)) values.pricePerCubicMeter = priceNumber;
        if (materialType !== storage.materialType) values.materialType = materialType;

        if (Object.keys(values).length === 0) {
            onClose();
            return;
        }

        setError(null);
        mutation.mutate(values);
    };

    return (
        <Dialog.Root
            open
            onOpenChange={(e) => !e.open && handleClose()}
            placement="center"
        >
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>Edit storage</Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            <VStack gap="4" align="stretch">
                                <SimpleGrid columns={2} gap={3}>
                                    <Field.Root required invalid={blockName.trim() === ""}>
                                        <Field.Label>Block name</Field.Label>
                                        <Input
                                            value={blockName}
                                            onChange={(e) => setBlockName(e.target.value)}
                                        />
                                        <Field.ErrorText>Enter a block name</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root>
                                        <Field.Label>Section</Field.Label>
                                        <Input
                                            placeholder="Optional"
                                            value={section}
                                            onChange={(e) => setSection(e.target.value)}
                                        />
                                    </Field.Root>
                                </SimpleGrid>

                                <SimpleGrid columns={2} gap={3} alignItems="start">
                                    <Field.Root required invalid={weightInvalid}>
                                        <Field.Label>Max weight (kg)</Field.Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            step="any"
                                            value={maxWeight}
                                            onChange={(e) => setMaxWeight(e.target.value)}
                                        />
                                        <Field.ErrorText>Must be greater than 0</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root required invalid={volumeInvalid}>
                                        <Field.Label>Total space (m³)</Field.Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            step="any"
                                            value={maxVolume}
                                            onChange={(e) => setMaxVolume(e.target.value)}
                                        />
                                        <Field.ErrorText>Must be greater than 0</Field.ErrorText>
                                    </Field.Root>
                                </SimpleGrid>

                                <SimpleGrid columns={2} gap={3} alignItems="start">
                                    <Field.Root required invalid={priceInvalid}>
                                        <Field.Label>Price per m³ (₱)</Field.Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            step="any"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                        />
                                        <Field.HelperText>Applies to new bookings only</Field.HelperText>
                                        <Field.ErrorText>Must be greater than 0</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root>
                                        <Field.Label>Material type</Field.Label>
                                        <NativeSelect.Root>
                                            <NativeSelect.Field
                                                value={materialType}
                                                onChange={(e) => setMaterialType(e.target.value as MaterialType)}
                                            >
                                                {MATERIAL_TYPES.map((m) => (
                                                    <option key={m} value={m}>
                                                        {materialLabel(m)}
                                                    </option>
                                                ))}
                                            </NativeSelect.Field>
                                            <NativeSelect.Indicator />
                                        </NativeSelect.Root>
                                        <Field.HelperText>Locked while bookings are active</Field.HelperText>
                                    </Field.Root>
                                </SimpleGrid>

                                {error && (
                                    <Text fontSize="sm" color="fg.error" role="alert">
                                        {error}
                                    </Text>
                                )}
                            </VStack>
                        </Dialog.Body>

                        <Dialog.Footer>
                            <Button variant="outline" onClick={handleClose} disabled={mutation.isPending}>
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit} loading={mutation.isPending} disabled={!canSave}>
                                Save changes
                            </Button>
                        </Dialog.Footer>

                        <Dialog.CloseTrigger asChild>
                            <CloseButton size="sm" />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};

export default EditStorageDialog;