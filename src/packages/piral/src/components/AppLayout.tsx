import * as React from 'react';
import { useGlobalState, GlobalState } from 'piral-core';
import { MenuProps, LayoutProps } from '../types';

function selectContent(state: GlobalState) {
  return {
    selectedLanguage: state.app.language.selected,
    availableLanguages: state.app.language.available,
    currentLayout: state.app.layout.current,
    user: state.user.current,
  };
}

export interface AppLayoutCreator {
  Layout: React.ComponentType<LayoutProps>;
  Menu: React.ComponentType<MenuProps>;
  Notifications: React.ComponentType;
  Search: React.ComponentType;
  Modals: React.ComponentType;
}

export function createAppLayout({ Layout, ...props }: AppLayoutCreator): React.SFC {
  return ({ children }) => {
    const content = useGlobalState(selectContent);
    return (
      <Layout {...content} {...props}>
        {children}
      </Layout>
    );
  };
}