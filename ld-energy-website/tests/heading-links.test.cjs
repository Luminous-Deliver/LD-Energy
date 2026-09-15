const {test}=require('node:test')
const assert=require('node:assert/strict')
const {createElement}=require('react')
const {headingText,extractToc,slugify}=require('../lib/heading-text.ts')

test('contents links and rendered headings agree when the heading contains inline links',()=>{
  const markdown='### Post-war flats (1945–1980, [Tower Hamlets](/areas/tower-hamlets), [Newham](/areas/newham))'
  const rendered=['Post-war flats (1945–1980, ',createElement('a',{href:'/areas/tower-hamlets'},'Tower Hamlets'),', ',createElement('a',{href:'/areas/newham'},'Newham'),')']
  assert.equal(extractToc(markdown)[0].id,slugify(headingText(rendered)))
  assert.equal(headingText(createElement('strong',null,['EPC ',createElement('code',null,'C')])), 'EPC C')
})
