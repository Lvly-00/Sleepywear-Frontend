import { showNotification } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons-react'; // Mantine uses Tabler icons

const notifySuccess = {
    addedItem: () =>
        showNotification({
            title: 'Success',
            message: 'Item added successfully!',
            color: 'green',
            icon: < IconCheck size = { 18 }
            />,
        }),

    editedItem: () =>
        showNotification({
            title: 'Success',
            message: 'Item updated successfully!',
            color: 'green',
            icon: < IconCheck size = { 18 }
            />,
        }),

    addedCollection: () =>
        showNotification({
            title: 'Success',
            message: 'Collection added successfully!',
            color: 'green',
            icon: < IconCheck size = { 18 }
            />,
        }),

    editedCollection: () =>
        showNotification({
            title: 'Success',
            message: 'Collection updated successfully!',
            color: 'green',
            icon: < IconCheck size = { 18 }
            />,
        }),

    addedOrder: () =>
        showNotification({
            title: 'Success',
            message: 'Order added successfully!',
            color: 'green',
            icon: < IconCheck size = { 18 }
            />,
        }),

    addedPayment: () =>
        showNotification({
            title: 'Success',
            message: 'Payment added successfully!',
            color: 'green',
            icon: < IconCheck size = { 18 }
            />,
        }),

    deleted: () =>
        showNotification({
            title: 'Success',
            message: 'Deleted successfully!',
            color: 'green',
            icon: < IconCheck size = { 18 }
            />,
        }),
};

export default notifySuccess;