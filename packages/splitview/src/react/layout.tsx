import * as React from "react";
import { IDisposable } from "../lifecycle";
import { Layout, Api } from "../layout/layout";
import { ReactPanelContentPart } from "./reactContentPart";
import { ReactPanelHeaderPart } from "./reactHeaderPart";
import { IPanelProps } from "./react";
import { ReactPanelDeserialzier } from "./deserializer";
import { GroupPanelFrameworkComponentFactory } from "../layout/options";

export interface OnReadyEvent {
  api: Api;
}

export interface ReactLayout {
  addPortal: (portal: React.ReactPortal) => IDisposable;
}

export interface IReactGridProps {
  components?: {
    [componentName: string]: React.FunctionComponent<IPanelProps>;
  };
  tabComponents?: {
    [componentName: string]: React.FunctionComponent<IPanelProps>;
  };
  watermarkComponent?: React.FunctionComponent;
  onReady?: (event: OnReadyEvent) => void;
  autoSizeToFitContainer?: boolean;
  serializedLayout?: {};
  deserializer?: {
    fromJSON: (
      data: any
    ) => {
      component: React.FunctionComponent<IPanelProps>;
      tabComponent?: React.FunctionComponent<IPanelProps>;
      props?: { [key: string]: any };
    };
  };
  debug?: boolean;
  tabHeight?: number;
  enableExternalDragEvents?: boolean;
}

export const ReactGrid = (props: IReactGridProps) => {
  const domReference = React.useRef<HTMLDivElement>();
  const layoutReference = React.useRef<Layout>();

  const [portals, setPortals] = React.useState<React.ReactPortal[]>([]);

  React.useEffect(() => {
    const addPortal = (p: React.ReactPortal) => {
      setPortals((portals) => [...portals, p]);
      return {
        dispose: () => {
          setPortals((portals) => portals.filter((portal) => portal !== p));
        },
      };
    };

    const factory: GroupPanelFrameworkComponentFactory = {
      content: {
        createComponent: (
          id: string,
          component: React.FunctionComponent<IPanelProps>
        ) => {
          return new ReactPanelContentPart(id, component, { addPortal });
        },
      },
      tab: {
        createComponent: (
          id: string,
          component: React.FunctionComponent<IPanelProps>
        ) => {
          return new ReactPanelHeaderPart(id, component, { addPortal });
        },
      },
    };

    const layout = new Layout({
      frameworkComponentFactory: factory,
      frameworkComponents: props.components,
      frameworkTabComponents: props.tabComponents,
      tabHeight: props.tabHeight,
      debug: props.debug,
      enableExternalDragEvents: props.enableExternalDragEvents,
    });

    layoutReference.current = layout;
    domReference.current.appendChild(layoutReference.current.element);

    layout.deserializer = new ReactPanelDeserialzier(layout);

    layout.resizeToFit();

    if (props.serializedLayout) {
      layout.deserialize(props.serializedLayout);
    }

    if (props.onReady) {
      props.onReady({ api: layout });
    }

    return () => {
      layout.dispose();
    };
  }, []);

  React.useEffect(() => {
    layoutReference.current.setAutoResizeToFit(props.autoSizeToFitContainer);
  }, [props.autoSizeToFitContainer]);

  return (
    <div
      style={{
        // height: "100%",
        width: "100%",
      }}
      ref={domReference}
    >
      {portals}
    </div>
  );
};