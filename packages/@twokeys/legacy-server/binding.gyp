{
  "targets": [
    {
      "target_name": "twokeys",
      'msvs_configuration_attributes': {
        'CharacterSet': 1
      },
      'cflags!': [ '-fno-exceptions' ],
      'cflags_cc!': [ '-fno-exceptions' ],
      'xcode_settings': {
        'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
        'CLANG_CXX_LIBRARY': 'libc++',
        'MACOSX_DEPLOYMENT_TARGET': '10.7',
      },
      'msvs_settings': {
        'VCCLCompilerTool': { 'ExceptionHandling': 1 },
      },
      'include_dirs': ["<!@(node -p \"require('node-addon-api').include\")"],
      'dependencies': ["<!(node -p \"require('node-addon-api').gyp\")"],
      "sources": [
        "./src/cpp/main.cc",
        "./src/cpp/run-ahk.cc",
        "./src/cpp/current-dir.cc"
      ],
    }
  ]
}
