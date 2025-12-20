module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: 'current'
      }
    }],
    ['@babel/preset-react', {
      runtime: 'automatic',
      development: process.env.NODE_ENV !== 'production',
      // Explicitly disable deprecated plugins
      useBuiltIns: true
    }],
    '@babel/preset-typescript'
  ],
  plugins: [
    // Disable problematic plugins
    ['@babel/plugin-transform-react-jsx', {
      runtime: 'automatic',
      pragma: 'React.createElement',
      pragmaFrag: 'React.Fragment',
      // These settings prevent __self and __source injection
      useSpread: false,
      pure: false
    }]
  ],
  env: {
    test: {
      presets: [
        ['@babel/preset-env', {
          targets: { node: 'current' }
        }],
        ['@babel/preset-react', {
          runtime: 'automatic',
          development: false,
          useBuiltIns: true
        }],
        '@babel/preset-typescript'
      ],
      plugins: [
        ['@babel/plugin-transform-react-jsx', {
          runtime: 'automatic',
          pragma: 'React.createElement',
          pragmaFrag: 'React.Fragment',
          useSpread: false,
          pure: false
        }]
      ]
    }
  }
};