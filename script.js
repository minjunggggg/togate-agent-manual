// ── COLLAPSIBLE FILE TREE ──
;(function initCollapsibleTree() {
    const container = document.querySelector('.file-tree')
    if (!container) return
    const pre = container.querySelector('pre')
    if (!pre) return

    const lines = pre.textContent.split('\n').filter(l => l !== '')

    function parseLine(line) {
        // Lines with ├── or └── : depth = prefix length / 4 + 1
        const m = line.match(/^(.*)([├└]── )(.+)$/)
        if (m) return { depth: (m[1].length / 4 | 0) + 1, name: m[3] }
        // Root line (no tree chars, e.g. "src")
        if (line.trim() && !/[│├└─]/.test(line)) return { depth: 0, name: line.trim() }
        return null
    }

    const items = lines.map(parseLine).filter(Boolean)

    // A node is a directory if the next node is deeper
    items.forEach((item, i) => {
        item.isDir = i + 1 < items.length && items[i + 1].depth > item.depth
    })

    function buildTree(items) {
        const rootUl = document.createElement('ul')
        rootUl.className = 'ct-list'
        // stack entries: { depth, ul }
        const stack = [{ depth: -1, ul: rootUl }]

        for (const item of items) {
            // Pop until we find the correct parent
            while (stack.length > 1 && stack[stack.length - 1].depth >= item.depth) {
                stack.pop()
            }
            const parentUl = stack[stack.length - 1].ul
            const li = document.createElement('li')

            if (item.isDir) {
                const details = document.createElement('details')
                if (item.depth <= 1) details.open = true
                const summary = document.createElement('summary')
                summary.className = 'ct-dir'
                summary.textContent = item.name
                const childUl = document.createElement('ul')
                childUl.className = 'ct-list'
                details.appendChild(summary)
                details.appendChild(childUl)
                li.appendChild(details)
                parentUl.appendChild(li)
                stack.push({ depth: item.depth, ul: childUl })
            } else {
                li.className = 'ct-file'
                li.textContent = item.name
                parentUl.appendChild(li)
            }
        }
        return rootUl
    }

    const treeEl = buildTree(items)

    const controls = document.createElement('div')
    controls.className = 'ct-controls'
    const expandBtn = document.createElement('button')
    expandBtn.className = 'ct-btn'
    expandBtn.textContent = '모두 펼치기'
    const collapseBtn = document.createElement('button')
    collapseBtn.className = 'ct-btn'
    collapseBtn.textContent = '모두 접기'
    controls.appendChild(expandBtn)
    controls.appendChild(collapseBtn)

    expandBtn.addEventListener('click', () =>
        container.querySelectorAll('details').forEach(d => d.open = true))
    collapseBtn.addEventListener('click', () =>
        container.querySelectorAll('details').forEach(d => d.open = false))

    const wrapper = document.createElement('div')
    wrapper.className = 'ct-wrapper'
    wrapper.appendChild(controls)
    wrapper.appendChild(treeEl)

    pre.replaceWith(wrapper)
})()

// ── COPY BUTTON ──
function copyCode(btn) {
    const pre = btn.closest('.code-block').querySelector('pre')
    const text = pre.innerText
    navigator.clipboard.writeText(text).then(() => {
        btn.textContent = '복사됨 ✓'
        btn.classList.add('copied')
        setTimeout(() => {
            btn.textContent = '복사'
            btn.classList.remove('copied')
        }, 2000)
    })
}

// ── ACTIVE NAV ──
const sections = document.querySelectorAll('section[id]')
const navLinks = document.querySelectorAll('nav a[href^="#"]')

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.id
            navLinks.forEach(a => {
                a.classList.toggle('active', a.getAttribute('href') === `#${id}`)
            })
        }
    })
}, { rootMargin: '-20% 0px -70% 0px' })

sections.forEach(s => observer.observe(s))

// ── SMOOTH SCROLL ──
navLinks.forEach(a => {
    a.addEventListener('click', e => {
        e.preventDefault()
        const target = document.querySelector(a.getAttribute('href'))
        if (target) target.scrollIntoView({ behavior: 'smooth' })
    })
})
