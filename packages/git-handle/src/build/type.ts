export interface SocketOn {
  on<Ev extends ReservedOrUserEventNames<DefaultEventsMap, DefaultEventsMap>>(
    ev: Ev,
    listener: ReservedOrUserListener<DefaultEventsMap, DefaultEventsMap, Ev>
  ): this
}

export interface DefaultEventsMap {
  [event: string]: (...args: any[]) => void
}

export type EventNames<Map extends EventsMap> = keyof Map & (string | symbol)

export interface EventsMap {
  [event: string]: any
}
export type ReservedOrUserEventNames<
  ReservedEventsMap extends EventsMap,
  UserEvents extends EventsMap,
> = EventNames<ReservedEventsMap> | EventNames<UserEvents>

type FallbackToUntypedListener<T> = [T] extends [never]
  ? (...args: any[]) => void | Promise<void>
  : T

export type ReservedOrUserListener<
  ReservedEvents extends EventsMap,
  UserEvents extends EventsMap,
  Ev extends ReservedOrUserEventNames<ReservedEvents, UserEvents>,
> = FallbackToUntypedListener<
  Ev extends EventNames<ReservedEvents> ? ReservedEvents[Ev] : Ev extends EventNames<UserEvents> ? UserEvents[Ev] : never
>
