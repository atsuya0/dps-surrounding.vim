# surround.vim
Add, change or remove brackets and quotes.  

Supported characters.  
(),  [],  {},  <>,  '',  "",  ``

# Install
Please refer to the link to install deno.  
https://deno.land/#installation  

## dein.vim
```toml
[[plugins]]
repo = 'vim-denops/denops.vim'

[[plugins]]
repo = 'tayusa/surround.vim'
```

# SurroundLine
A state where the cursor is at the second character.  
execute `SurroundLine<`.  

before
```
Hello World!
```
after
```
<Hello World!>
```

# SurroundWord
A state where the cursor is at the second character.  
execute `SurroundLine"`.  
before
```
Hello World!
```
after
```
"Hello" World!
```

# ChSurround
A state where the cursor is at the '{'.  
execute `ChSurround[`.  
before
```
const test = (arg: unknown) => {
  if ( typeof arg === 'string') {
    console.log(arg);
  }
}
```
after
```
const test = (arg: unknown) => [
  if ( typeof arg === 'string') {
    console.log(arg);
  }
]
```

# RmSurround
A state where the cursor is at the '('.  
execute `RmSurround`.  
before
```
const test = (arg: unknown) => {
  if ( typeof arg === 'string') {
    console.log(arg);
  }
}
```
after
```
const test = arg: unknown => {
  if ( typeof arg === 'string') {
    console.log(arg);
  }
}
```

# Example mappings
```vim
nmap <Leader>s [surround]
nnoremap <silent> [surround]l :SurroundLine<space>
nnoremap <silent> [surround]w :SurroundWord<space>
nnoremap <silent> [surround]c :ChSurround<space>
nnoremap <silent> [surround]r :RmSurround<CR>
```
