import nextra from 'nextra'

const withNextra = nextra({
  search: {
    codeblocks: false
  }
})

export default withNextra({
  transpilePackages: ['lucide-react', '@kaven/ui-base'],
  output: 'export',
  reactStrictMode: true,
})
