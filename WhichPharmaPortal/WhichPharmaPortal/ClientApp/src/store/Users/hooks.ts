import { useDispatch, useSelector } from "react-redux"
import { getUsersCollaborators } from "./selectors";
import { User } from "../../models/User";
import { fetchCollaborators } from "./actions";

export const useCollaborators = (): User[] => {
    const dispatch = useDispatch();
    var collaborators = useSelector(getUsersCollaborators);
    if(!collaborators?.length) {
        setTimeout(() => dispatch(fetchCollaborators()), 1000);
    }
    return collaborators;
}