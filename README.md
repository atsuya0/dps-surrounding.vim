# dps-surrounding.vim
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
repo = 'atsuya0/dps-surrounding.vim'
```

# SurroundLine
A state where the cursor is at the second character.  
execute `SurroundLine <`.  

![s1](https://user-images.githubusercontent.com/37957375/131354180-a991236f-bddc-4216-89f6-2416711aae0c.gif)

# SurroundWord
A state where the cursor is at the second character.  
execute `SurroundWord "`.  

![s2](https://user-images.githubusercontent.com/37957375/131354193-d0cf88c8-9951-42e7-9bf0-e596e95d310c.gif)

# RmSurrounding
A state where the cursor is at the \`.  
execute `RmSurrounding`.  

![s3](https://user-images.githubusercontent.com/37957375/131354203-f9630a21-2915-4f28-a77d-15a38d4ee562.gif)

# ChSurrounding
A state where the cursor is at the (.  
execute `ChSurrounding <`.  

![s4](https://user-images.githubusercontent.com/37957375/131354211-9b6cc6b5-b6ab-48cc-9551-f7534e3ce37a.gif)

# Example mappings
```vim
nmap <Leader>s [surrounding]
nnoremap <silent> [surrounding]l :SurroundLine<space>
nnoremap <silent> [surrounding]w :SurroundWord<space>
nnoremap <silent> [surrounding]c :ChSurrounding<space>
nnoremap <silent> [surrounding]r :RmSurrounding<CR>
```
