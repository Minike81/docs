import { TokenizationError } from 'liquidjs'

import { THROW_ON_EMPTY, DataReferenceError } from './error-handling.js'
import { getDataByLanguage } from '../../../lib/get-data.js'

const Syntax = /([a-z0-9/\\_.\-[\]]+)/i
const SyntaxHelp = "Syntax Error in 'data' - Valid syntax: data [path]"

export default {
  parse(tagToken) {
    if (!tagToken || !Syntax.test(tagToken.args)) {
      throw new TokenizationError(SyntaxHelp, tagToken)
    }

    this.path = tagToken.args
    this.tagToken = tagToken
  },

  async render(scope) {
    let text = getDataByLanguage(this.path, scope.environments.currentLanguage)
    if (text === undefined) {
      if (scope.environments.currentLanguage === 'en') {
        const message = `Can't find the key 'data ${this.path}' in the scope.`
        if (THROW_ON_EMPTY) {
          throw new DataReferenceError(message)
        }
        console.warn(message)
      }
      return
    }

    if (text.trim().split('\n\n').length === 1 && text.split('\n').length > 0) {
      const { input, begin } = this.tagToken
      let i = 1
      while (input.charAt(begin - i) === ' ') {
        i++ // this goes one character "to the left"
      }
      const goBack = input.slice(begin - i, begin)
      if (goBack.charAt(0) === '\n' && goBack.length > 1) {
        const numSpaces = goBack.length - 1
        text = text.trim().replace(/^/gm, ' '.repeat(numSpaces)).trim()
      }
    } else {
      text = text.trim()
    }

    return this.liquid.parseAndRender(text, scope.environments)
  },
}
