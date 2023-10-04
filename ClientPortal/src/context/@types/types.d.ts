export type AppContextType = {
    headerName: string;
    setHeaderName: (name: string) => void;
    isOpen: boolean;
    handleDrawerToggle:()=>void;

};
