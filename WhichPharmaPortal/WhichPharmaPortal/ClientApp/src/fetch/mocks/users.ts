import { AuthenticatedUser } from '../../models/AuthenticatedUser';
import { User } from '../../models/User';
import { UserRole } from '../../models/UserRole';

export const user: AuthenticatedUser = {
    username: 'fcardoso',
    email: 'coiso@coisa.pt',
    accessToken:
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImp0aSI6IjRlMGM2ZGRlLTRiOTctNDZmMC04MzdhLTQ5YTRhNjE4YjU4MyIsImlhdCI6MTU4OTQ1MDM0MCwiZXhwIjoxNjg5NDUzOTkwfQ.TExVrQB6-s2ZZqID-cz_FN66GVVzf_uVkgsm9bW4AFY',
    roles: [UserRole.Administrator],
    imageUrl: 'https://material-ui.com/static/images/avatar/2.jpg',
    settings: {
        'products-table': '{ "hiddenColumnNames": [ "productCode" ] }'
    }
};

export const users: User[] = [
    {
        username: 'fcardoso',
        email: 'coiso@coisa.pt',
        firstName: 'Fábio',
        lastName: 'Cardoso',
        imageUrl: 'https://material-ui.com/static/images/avatar/2.jpg',
        isLinkedToThirdPartyLogin: false,
        roles: [UserRole.Administrator, UserRole.Collaborator],
    },
    {
        username: 'andrei',
        firstName: 'Andrei',
        lastName: 'Tudos',
        isLinkedToThirdPartyLogin: false,
        roles: [UserRole.Collaborator],
    },
    {
        username: 'fonseca',
        firstName: 'Fonseca',
        lastName: 'André',
        imageUrl: 'https://material-ui.com/static/images/avatar/1.jpg',
        isLinkedToThirdPartyLogin: false,
        roles: [UserRole.Collaborator, UserRole.Supplier],
    },
]; 
