import type { ChatUser } from '@/types'
import { api } from '../axios'

export const getMyPicture = async () => {
    const req = await api.get(`/users/me/profile-picture`, {
        responseType: 'blob',
    })
    return URL.createObjectURL(req.data)
}

export const getProfileById = async (userId: string) => {
    const req = await api.get(`/users/${userId}/profile-picture`)
    return req.data
}

export const uploadProfilePic = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const res = await api.post('/users/upload/profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
}

export const searchUsers = async (q: string): Promise<ChatUser[]> => {
    const { data } = await api.get<
        {
            userId: string
            name: string
            email: string
            profilePicUrl: string | null
        }[]
    >('/users/search', { params: { q } })

    return data.map((u) => ({
        id: u.userId,
        name: u.name,
        email: u.email,
        profilePicUrl: u.profilePicUrl ?? null,
    }))
}

export const getUserByUsername = async (username: string) => {
    const req = await api.get(`/users/${encodeURIComponent(username)}`)
    return req.data
}

export const updateMyProfile = async (
    body: Partial<{
        name: string
        email: string
        contactNumber: string
        password: string
    }>
) => {
    const req = await api.patch('/users/me', body)
    return req.data
}
