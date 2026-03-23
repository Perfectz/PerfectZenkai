import {
  AVAILABLE_FUNCTIONS,
  FUNCTION_IMPLEMENTATIONS,
  type FunctionCallResult,
} from './FunctionRegistry'
import { getEnabledLegacyFunctionNames } from '@/app/module-system/capabilityBinder'

export type LegacyFunctionName = keyof typeof AVAILABLE_FUNCTIONS

export type LegacyFunctionDefinition =
  (typeof AVAILABLE_FUNCTIONS)[keyof typeof AVAILABLE_FUNCTIONS]

export type LegacyFunctionImplementation =
  (typeof FUNCTION_IMPLEMENTATIONS)[keyof typeof FUNCTION_IMPLEMENTATIONS]

const isLegacyFunctionName = (value: string): value is LegacyFunctionName =>
  value in AVAILABLE_FUNCTIONS

export const getBoundFunctionDefinitions = (): LegacyFunctionDefinition[] =>
  getEnabledLegacyFunctionNames()
    .filter(isLegacyFunctionName)
    .map((name) => AVAILABLE_FUNCTIONS[name])

export const getBoundFunctionImplementations = (): Partial<
  Record<LegacyFunctionName, LegacyFunctionImplementation>
> =>
  getEnabledLegacyFunctionNames()
    .filter(isLegacyFunctionName)
    .reduce<Partial<Record<LegacyFunctionName, LegacyFunctionImplementation>>>(
      (accumulator, name) => {
        accumulator[name] = FUNCTION_IMPLEMENTATIONS[name]
        return accumulator
      },
      {}
    )

export type { FunctionCallResult }