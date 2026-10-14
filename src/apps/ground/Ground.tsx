import React, { FC, useState } from "react";
import styled from "styled-components";
import { Doors } from "./pages/Doors";
import { Fuel } from "./pages/Fuel";
import { Payload } from "./pages/Payload";

const tabs = [
    { name: "Payload", page: Payload },
    { name: "Fuel", page: Fuel },
    { name: "Doors & cabin", page: Doors },
];

export const Ground: FC = () => {
    const [selected, setSelected] = useState(0);
    const Selected = tabs[selected].page;

    return (
        <Container>
            <TabBar>
                {tabs.map((tab, i) => (
                    <Tab key={tab.name} selected={i === selected} onClick={() => setSelected(i)}>
                        {tab.name}
                    </Tab>
                ))}
            </TabBar>
            <Content>
                <Selected />
            </Content>
        </Container>
    );
};

const Container = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background: ${(props) => props.theme.primary};
    color: ${(props) => props.theme.text};
    font-family: Roboto, sans-serif;
`;

const TabBar = styled.div`
    display: flex;
    justify-content: center;
    gap: 8px;
    padding: 16px 24px 0;
`;

const Tab = styled.div<{ selected: boolean }>`
    font-size: 24px;
    font-weight: 500;
    padding: 10px 28px;
    border-radius: 12px;
    background: ${(props) => (props.selected ? props.theme.select : props.theme.invert.primary)};
    color: ${(props) => (props.selected ? "white" : props.theme.text)};
`;

const Content = styled.div`
    flex: 1;
    min-height: 0;
`;
