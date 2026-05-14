import type React from "react";

export type Coordinates = [longitude: number, latitude: number];
export type ColorValue = string;
export type URLString = string;
export type HTMLString = string;
export type OptionalId<T> = Omit<T, "id"> & { id?: number };

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface SortParams {
  sort?: string;
  order?: "asc" | "desc";
}

export interface FilterParams {
  filter?: Record<string, unknown>;
}

export interface QueryParams
  extends PaginationParams,
    SortParams,
    FilterParams {}

export type TypeGuard<T> = (value: unknown) => value is T;

export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
}

export type EmptyObject = Record<string, never>;
export type BaseProps = Record<string, unknown>;

export type Prettify<T> = {
  [K in keyof T]: T[K];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type PartialFields<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export type EventHandler<T = Event> = (event: T) => void;
export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>;

export type ComponentProps<T> = T extends React.ComponentType<infer P>
  ? P
  : never;

export type PropsWithClassName<T = BaseProps> = T & { className?: string };

export type PropsWithChildren<T = BaseProps> = T & {
  children?: React.ReactNode;
};

export type NonEmptyArray<T> = [T, ...T[]];

export type AtLeastOne<
  T,
  U = { [K in keyof T]: Pick<T, K> & Partial<T> }
> = Partial<T> & U[keyof U];

export type ExactlyOne<T> = {
  [K in keyof T]: Pick<T, K> & Partial<Record<Exclude<keyof T, K>, never>>;
}[keyof T];

export type StrictObject<T> = T & Record<Exclude<string, keyof T>, never>;

export type FC<P = BaseProps> = React.FunctionComponent<P>;

export type ForwardRefComponent<
  T,
  P = BaseProps
> = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<P> & React.RefAttributes<T>
>;

export type ComponentWithChildren<P = BaseProps> = FC<PropsWithChildren<P>>;
