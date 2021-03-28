import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { isReactElement, ReactPartContext } from '../react';
import { ReactContentPartContext } from './reactContentPart';

interface WithChildren {
    children: React.ReactNode;
}

const Tab: React.FunctionComponent<WithChildren> = (props: WithChildren) => {
    return <>{props.children}</>;
};

const Body: React.FunctionComponent<WithChildren> = (props: WithChildren) => {
    return <>{props.children}</>;
};
const Action: React.FunctionComponent<WithChildren> = (props: WithChildren) => {
    return <>{props.children}</>;
};

function isValidComponent(element: React.ReactElement) {
    return [Body, Action, Tab].find((comp) => element.type === comp);
}

const Panel: React.FunctionComponent<WithChildren> = (props: WithChildren) => {
    const context = React.useContext(
        ReactPartContext
    ) as ReactContentPartContext;

    const sections = React.useMemo(() => {
        const childs =
            React.Children.map(props.children, (_) => _)?.filter(
                isReactElement
            ) || [];

        const isInvalid = !!childs.find((_) => !isValidComponent(_));

        if (isInvalid) {
            throw new Error(
                'Children of DockviewComponents.Panel must be one of the following: DockviewComponents.Body, DockviewComponents.Action, DockviewComponents.Tab'
            );
        }

        const body = childs.find((_) => _.type === Body);
        const actions = childs.find((_) => _.type === Action);
        const tab = childs.find((_) => _.type === Tab);

        return { body, actions, tab };
    }, [props.children]);

    React.useEffect(() => {
        /**
         * hide or show the default tab behavior based on whether we want to override
         * with our own React tab.
         */
        if (sections.tab) {
            context.tabPortalElement.hide();
        } else {
            context.tabPortalElement.show();
        }
    }, [sections.tab]);

    return (
        <>
            {sections.actions &&
                ReactDOM.createPortal(
                    sections.actions,
                    context.actionsPortalElement
                )}
            {sections.tab &&
                ReactDOM.createPortal(
                    sections.tab,
                    context.tabPortalElement.element
                )}
            {sections.body || props.children}
        </>
    );
};

export const DockviewComponents = { Tab, Body, Action, Panel };