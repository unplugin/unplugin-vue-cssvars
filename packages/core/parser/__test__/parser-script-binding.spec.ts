import { describe, expect, test } from 'vitest'
import { parse } from '@vue/compiler-sfc'
import { getObjectExpressionReturnNode } from '../parser-variable'
import { analyzeScriptBindings } from '../parser-script-bindings'

describe('parse sfc to set bindings type', () => {
  test('ref', () => {
    const mockSFC = `
    <script lang="ts" setup>
     const color = ref('red')
     let foo = ref('foo')
    </script>
    `
    const { descriptor } = parse(mockSFC)
    const bindings = analyzeScriptBindings(descriptor)
    expect(bindings).toMatchObject({
      color: 'setup-ref',
      foo: 'setup-let',
    })
  })

  test('reactive', () => {
    const mockSFC = `
    <script lang="ts" setup>
     const color = reactive({ color: 'red' })
     let foo = reactive({ foo: 'foo' })
    </script>
    `
    const { descriptor } = parse(mockSFC)
    const bindings = analyzeScriptBindings(descriptor)
    expect(bindings).toMatchObject({
      color: 'setup-reactive-const',
      foo: 'setup-let',
    })
  })

  test('normal variable', () => {
    const mockSFC = `
    <script lang="ts" setup>
     const head2 = new Map()
     const color = 'red'
     const foo = { foo: 'foo' }
     const bar = 100
     const head = [1]
    
     let color1 = 'red'
     let foo1 = { foo: 'foo' }
     let bar1 = 100
     let head1 = [1]
    </script>
    `
    const { descriptor } = parse(mockSFC)
    const bindings = analyzeScriptBindings(descriptor)
    expect(bindings).toMatchObject({
      color: 'literal-const',
      foo: 'setup-const',
      bar: 'literal-const',
      head: 'setup-const',
      color1: 'setup-let',
      foo1: 'setup-let',
      bar1: 'setup-let',
      head1: 'setup-let',
      head2: 'setup-maybe-ref',
    })
  })

  test('define function', () => {
    const mockSFC = `
    <script lang="ts" setup>
     const fn = () => {}
     const fn2 = function (){}
     function fn3(){}
     
     let fn4 = () => {}
     let fn5 = function (){}
    </script>
    `
    const { descriptor } = parse(mockSFC)
    const bindings = analyzeScriptBindings(descriptor)
    expect(bindings).toMatchObject({
      fn: 'setup-const',
      fn2: 'setup-const',
      fn3: 'setup-const',
      fn4: 'setup-let',
      fn5: 'setup-let',
    })
  })

  test('function call', () => {
    const mockSFC = `
    <script lang="ts" setup>
     const fn = () => {}
     const fn2 = fn()
     
     let fn4 = () => {}
     let fn5 = fn4()
    </script>
    `
    const { descriptor } = parse(mockSFC)
    const bindings = analyzeScriptBindings(descriptor)
    expect(bindings).toMatchObject({
      fn: 'setup-const',
      fn2: 'setup-maybe-ref',
      fn4: 'setup-let',
      fn5: 'setup-let',
    })
  })

  test('Object deconstruct', () => {
    const mockSFC = `
    <script lang="ts" setup>
    const {foo: fooAlias, bar, head: {heads: hh} } = a
    </script>
    `
    const { descriptor } = parse(mockSFC)
    const bindings = analyzeScriptBindings(descriptor)
    expect(bindings).toMatchObject({
      fooAlias: 'setup-maybe-ref',
      bar: 'setup-maybe-ref',
      hh: 'setup-maybe-ref',
    })
  })

  test('define props', () => {
    const mockSFC = `
    <script lang="ts" setup>
    const props = defineProps(
        {
            color: {
                type: String
            }
        }
    )
    </script>
    `
    const { descriptor } = parse(mockSFC)
    const bindings = analyzeScriptBindings(descriptor)
    expect(bindings).toMatchObject({
      color: 'props',
      props: 'setup-reactive-const',
    })
  })

  test('define props & default value', () => {
    const mockSFC = `
    <script lang="ts" setup>
    interface Props {
      msg?: string
      labels?: string[]
    }
    const propsAlias = withDefaults(defineProps<Props>(), { 
        msg: 'hello',  
        labels: () => ['one', 'two'], 
    });
    </script>
    `
    const { descriptor } = parse(mockSFC)
    const bindings = analyzeScriptBindings(descriptor)
    expect(bindings).toMatchObject({
      propsAlias: 'setup-const',
      msg: 'props',
      labels: 'props',
    })
  })

  test('define props & default value & deconstruct', () => {
    const mockSFC = `
    <script lang="ts" setup>
    interface Props {
      msg?: string
      labels?: string[]
    }
    const propsAlias = withDefaults(defineProps<Props>(), { 
        msg: 'hello',  
        labels: () => ['one', 'two'], 
    });
     const { msg, labels } = propsAlias
    </script>
    `
    const { descriptor } = parse(mockSFC)
    const bindings = analyzeScriptBindings(descriptor)
    expect(bindings).toMatchObject({
      propsAlias: 'setup-const',
      msg: 'setup-maybe-ref',
      labels: 'setup-maybe-ref',
    })
  })
})
