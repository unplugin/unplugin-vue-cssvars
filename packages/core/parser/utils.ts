// Enums:
/** This is derived from `@vue/compiler-core` */
import type { BindingTypes as VueBindingTypes } from '@vue/compiler-dom'
export const CSSVarsBindingTypes = {
  /**
   * returned from data()
   */
  DATA: 'data' as VueBindingTypes.DATA,
  /**
   * declared as a prop ✅
   */
  PROPS: 'props' as VueBindingTypes.PROPS,
  /**
   * a local alias of a `<script setup>` destructured prop.
   * the original is stored in __propsAliases of the bindingMetadata object.
   */
  PROPS_ALIASED: 'props-aliased' as VueBindingTypes.PROPS_ALIASED,
  /**
   * a let binding (may or may not be a ref) ✅
   */
  SETUP_LET: 'setup-let' as VueBindingTypes.SETUP_LET,
  /**
   * a const binding that can never be a ref.
   * these bindings don't need `unref()` calls when processed in inlined
   * template expressions. ✅
   */
  SETUP_CONST: 'setup-const' as VueBindingTypes.SETUP_CONST,
  /**
   * a const binding that does not need `unref()`, but may be mutated. ✅
   */
  SETUP_REACTIVE_CONST: 'setup-reactive-const' as VueBindingTypes.SETUP_REACTIVE_CONST,
  /**
   * a const binding that may be a ref. ✅
   */
  SETUP_MAYBE_REF: 'setup-maybe-ref' as VueBindingTypes.SETUP_MAYBE_REF,
  /**
   * bindings that are guaranteed to be refs ✅
   */
  SETUP_REF: 'setup-ref' as VueBindingTypes.SETUP_REF,
  /**
   * declared by other options, e.g. computed, inject
   */
  OPTIONS: 'options' as VueBindingTypes.OPTIONS,
  /**
   * a literal constant, e.g. 'foo', 1, true ✅
   */
  LITERAL_CONST: 'literal-const' as VueBindingTypes.LITERAL_CONST,
} as const
