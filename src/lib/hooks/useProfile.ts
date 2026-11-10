import { useQuery } from '@tanstack/react-query'
import { authcheck } from '../api/auth'
import { getMyPicture } from '../api/user'

const useProfile = () => {
    const userQuery = useQuery({
        queryKey: ['currentUser'],
        queryFn: () => authcheck(),
        staleTime: 5 * 60 * 1000,
        retry: false,
    })

    const profileQuery = useQuery({
        queryKey: ['profile'],
        queryFn: () => getMyPicture(),
        staleTime: 5 * 60 * 1000,
        retry: false,
    })

    return {
        user: userQuery.data,
        profile: profileQuery.data,
        isLoading: userQuery.isLoading || profileQuery.isLoading,
        isError: userQuery.isError || profileQuery.isError,
        userQuery,
        profileQuery,
    }
}

export default useProfile
