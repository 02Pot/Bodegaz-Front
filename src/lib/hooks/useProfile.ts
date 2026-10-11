import { useQuery } from "@tanstack/react-query";
import { getMyPicture } from "../api/user";

const useProfile = () => {
    return useQuery({
        queryKey: ["profile"],
        queryFn: () => getMyPicture(),
        staleTime: 5 * 60 * 1000,
        retry:false
    });
    
}

export default useProfile