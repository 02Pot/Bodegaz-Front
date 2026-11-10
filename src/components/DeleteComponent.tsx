import { Button, Dialog, Portal } from '@chakra-ui/react'

type Props = {
    open: boolean
    title?: string
    description?: string
    loading?: boolean
    onClose: () => void
    onConfirm: () => void
}

export const DeleteConfirmationDialog = ({
    open,
    title = 'Are you sure?',
    description = 'This action cannot be undone.',
    loading = false,
    onClose,
    onConfirm,
}: Props) => (
    <Dialog.Root
        role="alertdialog"
        open={open}
        onOpenChange={(e) => !e.open && onClose()}
        placement="center"
    >
        <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
                <Dialog.Content>
                    <Dialog.Header>
                        <Dialog.Title>{title}</Dialog.Title>
                    </Dialog.Header>
                    <Dialog.Body>{description}</Dialog.Body>
                    <Dialog.Footer>
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            colorPalette="red"
                            onClick={onConfirm}
                            loading={loading}
                        >
                            Delete
                        </Button>
                    </Dialog.Footer>
                </Dialog.Content>
            </Dialog.Positioner>
        </Portal>
    </Dialog.Root>
)
