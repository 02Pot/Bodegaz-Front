import { qk } from "@/lib/queryKeys";
import type { StorageTypeResponse } from "@/types";
import {
    Button,
    Dialog,
    Field,
    Input,
    NativeSelect,
    Portal,
    SimpleGrid,
    Stack,
    Text
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useState } from "react";

type Props = {
    open: boolean;
    onClose: () => void;
    warehouseName: string;
    remainingCapacityKg: number;
    storageTypes: StorageTypeResponse[];
    materialTypes: string[];
    onSubmit: (values: AddStorageValues) => Promise<void>;
};

export type AddStorageValues = {
    storageTypeId: string
    blockName: string;
    section: string
    materialType: string
    maxWeight?: number
    maxVolumeCubicMeter: number
    pricePerCubicMeter: number
    quantity: number
};

const empty = () => ({
    storageTypeId: "",
    blockName: "",
    section: "",
    materialType: "",
    maxWeight: "",
    maxVolumeCubicMeter: "",
    pricePerCubicMeter: "",
    quantity: "1",
});
type FormState = ReturnType<typeof empty>;

const MAX_QUANTITY = 50;

const AddStorageDialog = ({
    open,
    onClose,
    warehouseName,
    remainingCapacityKg,
    storageTypes,
    materialTypes,
    onSubmit,
}: Props) => {
    const [form, setForm] = useState<FormState>(empty());
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [serverError, setServerError] = useState<string | null>(null);

    const set = (k: keyof FormState, v: string) => setForm((f) => ({ ...f, [k]: v }));

    const selectedType = storageTypes.find((t) => t.storageTypeId === form.storageTypeId);
    const typeCapacity = selectedType?.capacityWeight;
    const qty = Number(form.quantity);
    const perUnitKg = form.maxWeight === "" ? typeCapacity ?? 0 : Number(form.maxWeight);
    const totalKg = perUnitKg * (Number.isFinite(qty) ? qty : 0);

    const queryClient = useQueryClient();

    const reset = () => {
        setForm(empty());
        setErrors({});
        setServerError(null);
    };

    const mutation = useMutation({
        mutationFn: onSubmit,
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: qk.storagesAll }),
                queryClient.invalidateQueries({ queryKey: qk.warehousesAll }),
            ]);
            reset();
            onClose();
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            setServerError(error.response?.data?.message ?? "Failed to save storage");
        },
    });

    const handleClose = () => {
        if (mutation.isPending) return;
        reset();
        onClose();
    };

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.blockName.trim()) e.blockName = "Enter a block name";
        if (!form.storageTypeId) e.storageTypeId = "Choose a storage type";
        if (!form.materialType) e.materialType = "Choose a material type";

        if (form.maxWeight !== "") {
            const w = Number(form.maxWeight);
            if (!(w > 0)) e.maxWeight = "Enter a weight greater than 0";
            else if (typeCapacity !== undefined && w > typeCapacity)
                e.maxWeight = `This type holds up to ${typeCapacity} kg`;
        }

        if (!(Number(form.maxVolumeCubicMeter) > 0)) {
            e.maxVolumeCubicMeter = "Enter a space greater than 0";
        }

        if (!(Number(form.pricePerCubicMeter) > 0)) {
            e.pricePerCubicMeter = "Enter a price greater than 0";
        }

        if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QUANTITY) {
            e.quantity = `Enter a whole number from 1 to ${MAX_QUANTITY}`;
        } else if (!e.maxWeight && totalKg > remainingCapacityKg) {
            e.quantity = `Needs ${totalKg} kg but only ${remainingCapacityKg} kg is left`;
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const submit = () => {
        setServerError(null);
        if (!validate()) return;

        mutation.mutate({
            storageTypeId: form.storageTypeId,
            blockName: form.blockName.trim(),
            section: form.section.trim(),
            materialType: form.materialType,
            maxWeight: form.maxWeight === "" ? undefined : Number(form.maxWeight),
            maxVolumeCubicMeter: Number(form.maxVolumeCubicMeter),
            pricePerCubicMeter: Number(form.pricePerCubicMeter),
            quantity: qty,
        });
    };

    const namePreview =
        qty > 1 && qty <= MAX_QUANTITY && form.blockName.trim()
            ? `Creates ${form.blockName.trim()}-1 to ${form.blockName.trim()}-${qty}`
            : "";

    return (
        <Dialog.Root open={open} onOpenChange={(d) => !d.open && handleClose()} placement="center">
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content maxW="md">
                        <Dialog.Header flexDirection="column" alignItems="flex-start" gap={1}>
                            <Dialog.Title>Add storage</Dialog.Title>
                            <Text fontSize="sm" color="fg.muted">
                                {warehouseName} · {remainingCapacityKg} kg capacity left
                            </Text>
                        </Dialog.Header>

                        <Dialog.Body>
                            <Stack gap={4}>
                                <Field.Root invalid={!!errors.storageTypeId} required>
                                    <Field.Label>Storage type</Field.Label>
                                    <NativeSelect.Root>
                                        <NativeSelect.Field
                                            value={form.storageTypeId}
                                            onChange={(e) => set("storageTypeId", e.target.value)}
                                        >
                                            <option value="">Select a type</option>
                                            {storageTypes.map((t) => (
                                                <option key={t.storageTypeId} value={t.storageTypeId}>
                                                    {t.name}
                                                </option>
                                            ))}
                                        </NativeSelect.Field>
                                        <NativeSelect.Indicator />
                                    </NativeSelect.Root>
                                    {typeCapacity !== undefined && (
                                        <Field.HelperText>Holds up to {typeCapacity} kg per unit</Field.HelperText>
                                    )}
                                    <Field.ErrorText>{errors.storageTypeId}</Field.ErrorText>
                                </Field.Root>

                                <SimpleGrid columns={2} gap={3}>
                                    <Field.Root invalid={!!errors.blockName} required>
                                        <Field.Label>Block name</Field.Label>
                                        <Input
                                            value={form.blockName}
                                            onChange={(e) => set("blockName", e.target.value)}
                                            placeholder="Block A"
                                        />
                                        <Field.ErrorText>{errors.blockName}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root>
                                        <Field.Label>Section</Field.Label>
                                        <Input
                                            value={form.section}
                                            onChange={(e) => set("section", e.target.value)}
                                            placeholder="Optional"
                                        />
                                    </Field.Root>
                                </SimpleGrid>

                                <Field.Root invalid={!!errors.materialType} required>
                                    <Field.Label>Material type</Field.Label>
                                    <NativeSelect.Root>
                                        <NativeSelect.Field
                                            value={form.materialType}
                                            onChange={(e) => set("materialType", e.target.value)}
                                        >
                                            <option value="">Select a material</option>
                                            {materialTypes.map((m) => (
                                                <option key={m} value={m}>
                                                    {m.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
                                                </option>
                                            ))}
                                        </NativeSelect.Field>
                                        <NativeSelect.Indicator />
                                    </NativeSelect.Root>
                                    <Field.ErrorText>{errors.materialType}</Field.ErrorText>
                                </Field.Root>

                                <SimpleGrid columns={2} gap={3} alignItems="start">
                                    <Field.Root invalid={!!errors.maxWeight}>
                                        <Field.Label>Max weight each (kg)</Field.Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            value={form.maxWeight}
                                            onChange={(e) => set("maxWeight", e.target.value)}
                                            placeholder={typeCapacity !== undefined ? String(typeCapacity) : "Type default"}
                                        />
                                        <Field.HelperText>Blank uses the type's capacity</Field.HelperText>
                                        <Field.ErrorText>{errors.maxWeight}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root invalid={!!errors.maxVolumeCubicMeter} required>
                                        <Field.Label>Total space each (m³)</Field.Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            step="any"
                                            value={form.maxVolumeCubicMeter}
                                            onChange={(e) => set("maxVolumeCubicMeter", e.target.value)}
                                            placeholder="e.g. 100"
                                        />
                                        <Field.HelperText>Room size customers can rent</Field.HelperText>
                                        <Field.ErrorText>{errors.maxVolumeCubicMeter}</Field.ErrorText>
                                    </Field.Root>
                                </SimpleGrid>

                                <SimpleGrid columns={2} gap={3} alignItems="start">
                                    <Field.Root invalid={!!errors.pricePerCubicMeter} required>
                                        <Field.Label>Price per m³ (₱)</Field.Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            step="any"
                                            value={form.pricePerCubicMeter}
                                            onChange={(e) => set("pricePerCubicMeter", e.target.value)}
                                            placeholder="e.g. 500"
                                        />
                                        <Field.HelperText>Charged per month</Field.HelperText>
                                        <Field.ErrorText>{errors.pricePerCubicMeter}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root invalid={!!errors.quantity} required>
                                        <Field.Label>Quantity</Field.Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            max={MAX_QUANTITY}
                                            value={form.quantity}
                                            onChange={(e) => set("quantity", e.target.value)}
                                        />
                                        {namePreview && <Field.HelperText>{namePreview}</Field.HelperText>}
                                        <Field.ErrorText>{errors.quantity}</Field.ErrorText>
                                    </Field.Root>
                                </SimpleGrid>

                                {totalKg > 0 && (
                                    <Text fontSize="sm" color="fg.muted">
                                        Total added: {totalKg} kg of {remainingCapacityKg} kg left
                                    </Text>
                                )}

                                {serverError && (
                                    <Text fontSize="sm" color="fg.error" role="alert">
                                        {serverError}
                                    </Text>
                                )}
                            </Stack>
                        </Dialog.Body>

                        <Dialog.Footer>
                            <Button variant="outline" onClick={handleClose} disabled={mutation.isPending}>
                                Cancel
                            </Button>
                            <Button
                                bg="black"
                                color="white"
                                _hover={{ bg: "gray.800" }}
                                onClick={submit}
                                loading={mutation.isPending}
                            >
                                {qty > 1 && qty <= MAX_QUANTITY ? `Add ${qty} storages` : "Add storage"}
                            </Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};

export default AddStorageDialog;