
type NexusState = "default" | "pulse" | "sequence" | "horizon";

type Listener = (state: NexusState) => void;

let currentState: NexusState = "default";
const listeners = new Set<Listener>();

export const nexusStore = {
    getState: () => currentState,
    setState: (newState: NexusState) => {
        if (currentState !== newState) {
            currentState = newState;
            listeners.forEach((listener) => listener(currentState));
        }
    },
    subscribe: (listener: Listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    }
};
