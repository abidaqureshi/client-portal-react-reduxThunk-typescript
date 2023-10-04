export const AvailabilityColors: { [key: string]: string } = {
    NotAuthorised: 'black',
    NotMarketed: 'black',
    ShortageFuture: 'blue',
    //NotMarketed: 'lightgrey',
    Shortage3M: 'yellow',
    Shortage3to6M: 'orange',
    Shortage6M: 'red',
    Marketed: '#87ba65',
    Unknown: 'lightgrey',
};

export const AvailabilityTerms: { [key: string]: string } = {
    NotAuthorised: 'Not Marketed',
    NotMarketed: 'Not Marketed',
    ShortageFuture: 'Future Shortage/Future Discontinued',
    Shortage3M: 'Shortage',
    Shortage3to6M: 'Shortage',
    Shortage6M: 'Shortage',
    Marketed: 'Comercialised',
    Unknown: 'Authorized/Marketed status not confirmed',
};

export const AvailabilityColorsFront: { [key: string]: string } = {
    NotAuthorised: 'white',
    NotMarketed: 'white',
    ShortageFuture: 'white',
    Shortage3M: 'black',
    Shortage3to6M: 'white',
    Shortage6M: 'white',
    Marketed: 'white',
    Unknown: 'white',
};
