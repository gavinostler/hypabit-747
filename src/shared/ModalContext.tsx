import React, { createContext, FC, ReactNode, useState } from "react";

export const ModalContext = createContext<{ modal: ReactNode | null; setModal: (modal: ReactNode | null) => void }>({
    modal: null,
    setModal: () => {},
});

export const ModalProvider: FC<{ children: ReactNode | ReactNode[] }> = ({ children }) => {
    const [modal, setModal] = useState<ReactNode | null>(null);

    return (
        <ModalContext.Provider value={{ modal, setModal }}>
            {children}
            {modal}
        </ModalContext.Provider>
    );
};
