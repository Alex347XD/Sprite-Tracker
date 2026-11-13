p='js/app.js'
lines=open(p,encoding='utf-8').read().splitlines(keepends=True)
# find start line
start=None
for i,l in enumerate(lines):
    if 'const riftSprites = [' in l:
        start=i
        break
# find end: next line with 'const normalized = normalizeSpriteList(sprites);'
end=None
for j in range(start,len(lines)):
    if 'const normalized = normalizeSpriteList(sprites);' in lines[j]:
        end=j
        break
print('start',start,'end',end)
# remove lines start..end-1
new=lines[:start]+lines[end:]
open(p,'w',encoding='utf-8').writelines(new)
print('done')
PY