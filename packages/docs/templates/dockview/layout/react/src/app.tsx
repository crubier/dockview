import {
    DockviewApi,
    DockviewReact,
    DockviewReadyEvent,
    IDockviewPanelProps,
} from 'dockview';
import React from 'react';

const components = {
    default: (props: IDockviewPanelProps<{ title: string }>) => {
        return (
            <div
                style={{
                    height: '100%',
                    padding: '20px',
                    background: 'var(--dv-group-view-background-color)',
                }}
            >
                {props.params.title}
            </div>
        );
    },
};

function loadDefaultLayout(api: DockviewApi) {
    api.addPanel({
        id: 'panel_1',
        component: 'default',
    });

    api.addPanel({
        id: 'panel_2',
        component: 'default',
    });

    api.addPanel({
        id: 'panel_3',
        component: 'default',
    });
}

export const DockviewPersistence = (props: { theme?: string }) => {
    const [api, setApi] = React.useState<DockviewApi>();

    const clearLayout = () => {
        localStorage.removeItem('dockview_persistence_layout');
        if (api) {
            api.clear();
            loadDefaultLayout(api);
        }
    };

    const onReady = (event: DockviewReadyEvent) => {
        const layoutString = localStorage.getItem(
            'dockview_persistence_layout'
        );

        let success = false;

        if (layoutString) {
            try {
                const layout = JSON.parse(layoutString);
                event.api.fromJSON(layout);
                success = true;
            } catch (err) {
                console.error(err);
            }
        }

        if (!success) {
            loadDefaultLayout(event.api);
        }

        setApi(event.api);
    };

    React.useEffect(() => {
        if (!api) {
            return;
        }

        api.onDidLayoutChange(() => {
            const layout = api.toJSON();

            localStorage.setItem(
                'dockview_persistence_layout',
                JSON.stringify(layout)
            );
        });
    }, [api]);

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
            }}
        >
            <div style={{ height: '25px' }}>
                <button onClick={clearLayout}>Reset Layout</button>
            </div>
            <div
                style={{
                    flexGrow: 1,
                    overflow: 'hidden',
                }}
            >
                <DockviewReact
                    onReady={onReady}
                    components={components}
                    watermarkComponent={Watermark}
                    className={`${props.theme || 'dockview-theme-abyss'}`}
                />
            </div>
        </div>
    );
};

export default DockviewPersistence;

const Watermark = () => {
    return <div style={{ color: 'white', padding: '8px' }}>watermark</div>;
};
