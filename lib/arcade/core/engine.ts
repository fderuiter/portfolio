/**
 * Base abstract class and typed EventBus for all headless arcade game engines.
 * Zero framework dependencies. Testable in pure Node.js/Vitest.
 */

export abstract class ArcadeEngine<TState, TSnapshot> {
  protected state: TState;
  protected cachedSnapshot: TSnapshot | null = null;
  private readonly subscribers = new Set<() => void>();
  private readonly eventListeners = new Map<string, Set<(payload: unknown) => void>>();

  constructor(initialState: TState) {
    this.state = initialState;
  }

  /**
   * Initializes engine resources, object pools, and audio bindings.
   */
  public abstract init(): void;

  /**
   * Advances deterministic simulation physics by fixed delta time dt (in seconds).
   */
  public abstract update(dt: number): void;

  /**
   * Renders in-world graphics to the 2D canvas with sub-frame alpha interpolation.
   */
  public abstract render(ctx: CanvasRenderingContext2D, alpha: number): void;

  /**
   * Generates a fresh immutable state snapshot.
   */
  public abstract createSnapshot(): TSnapshot;

  /**
   * Returns a cached immutable state snapshot for React useSyncExternalStore.
   * Reference is preserved until notifySubscribers() is explicitly called.
   */
  public getSnapshot(): TSnapshot {
    if (this.cachedSnapshot === null) {
      this.cachedSnapshot = this.createSnapshot();
    }
    return this.cachedSnapshot;
  }

  /**
   * Handles canvas dimension and device pixel ratio resize events.
   */
  public resize(_width: number, _height: number, _dpr: number): void {
    // Default no-op, override in subclass if needed
  }

  /**
   * Cleans up engine timers, event subscriptions, and resources.
   */
  public destroy(): void {
    this.subscribers.clear();
    this.eventListeners.clear();
  }

  /**
   * Subscribes a listener to snapshot state updates (React useSyncExternalStore).
   */
  public subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Invalidates cached snapshot and broadcasts a state change to subscribers.
   */
  public notifySubscribers(): void {
    this.cachedSnapshot = this.createSnapshot();
    for (const sub of this.subscribers) {
      sub();
    }
  }

  /**
   * Subscribes to a typed one-shot action event (e.g. sfx, haptic, screen shake).
   */
  public on<T = unknown>(event: string, callback: (payload: T) => void): () => void {
    let set = this.eventListeners.get(event);
    if (!set) {
      set = new Set();
      this.eventListeners.set(event, set);
    }
    set.add(callback as (payload: unknown) => void);

    return () => {
      set?.delete(callback as (payload: unknown) => void);
      if (set && set.size === 0) {
        this.eventListeners.delete(event);
      }
    };
  }

  /**
   * Emits a typed event to registered listeners.
   */
  public emit<T = unknown>(event: string, payload: T): void {
    const set = this.eventListeners.get(event);
    if (set) {
      for (const listener of set) {
        listener(payload);
      }
    }
  }
}
