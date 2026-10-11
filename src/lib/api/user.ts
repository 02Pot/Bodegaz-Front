import { api } from "../axios";

export const getMyPicture = async () => {
    const req = await api.get(`/users/me/profile-picture`,{responseType: 'blob'});
    return URL.createObjectURL(req.data);
};

export const getProfileById = async (userId: string) => {
    const req = await api.get(`/users/${userId}/profile-picture`);
    return req.data;
};

export const uploadProfilePic = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await api.post('/users/upload/profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
};