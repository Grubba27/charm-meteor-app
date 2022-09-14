import {Meteor} from "meteor/meteor";
import {z} from "zod";


interface SubscriptionCallbacks {
  onStop?: (err?: any) => void,
  onReady?: () => void
}

declare module 'meteor/rpc' {

  type ReturnMethod<Name extends string, S extends z.ZodUndefined | z.ZodTypeAny, T> = {
    config: {
      name: Name;
      schema: S,
      rateLimit?: {
        interval: number,
        limit: number
      }
      run: (this: Meteor.MethodThisType, args: z.output<S>) => T
    };
    (args?: z.input<S>): Promise<T>
  }


  type ReturnSubscription<Name extends string, S extends z.ZodUndefined | z.ZodTypeAny, T> = {
    configuration: {
      name: Name;
      schema: S,
      rateLimit?: {
        interval: number,
        limit: number
      }
      run: (this: Meteor.MethodThisType, args: z.output<S>) => T
    };
    subscribe: (args?: z.input<S>, callbacks?: SubscriptionCallbacks) => Meteor.SubscriptionHandle
  }
  type Config<S extends z.ZodUndefined | z.ZodTypeAny, T> = {
    rateLimit?: {
      interval: number,
      limit: number
    },
    methodHooks?: {
      beforeResolve?: (args: z.input<S>, err: null | Meteor.Error, result: T) => void,
      afterResolve?: (args: z.input<S>, result: T) => void
      onErrorResolve?: (err: null | Meteor.Error, result: T) => void,
    }
  }

  type Method =
    <Name extends string, S extends z.ZodUndefined | z.ZodTypeAny, T>
    (name: Name, schema: S,
     run:
       (this: Meteor.MethodThisType, args: z.output<S>) => T,
     config?: Config<S, T>
    ) => ReturnMethod<Name, S, T>

  type Subscription =
    <Name extends string, S extends z.ZodUndefined | z.ZodTypeAny, T>
    (name: Name, schema: S,
     run:
       (this: Meteor.MethodThisType, args: z.output<S>) => T,
     config?: Config<S, T>
    ) => ReturnSubscription<Name, S, T>

}
