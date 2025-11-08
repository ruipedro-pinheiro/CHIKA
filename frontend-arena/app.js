// === CONFIG ===
const API_URL = 'http://localhost:8000'

// === STATE ===
let state = {
    selectedAIs: ['claude'],
    currentRoom: null,
    nodes: [],
    links: [],
    simulation: null,
    isLoading: false
}

// === DOM ===
const $ = (s) => document.querySelector(s)
const $$ = (s) => document.querySelectorAll(s)

const els = {
    graph: $('#graph-container'),
    form: $('#chat-form'),
    input: $('#message-input'),
    loading: $('#loading'),
    toast: $('#toast'),
    detailPanel: $('#detail-panel'),
    detailContent: $('#detail-content'),
    aiChips: $$('.ai-chip'),
    resetBtn: $('#reset-view'),
    clearBtn: $('#clear-graph')
}

// === UTILS ===
const showToast = (msg, type = 'info') => {
    els.toast.textContent = msg
    els.toast.className = `toast ${type}`
    setTimeout(() => els.toast.classList.add('hidden'), 4000)
}

const setLoading = (loading) => {
    state.isLoading = loading
    els.loading.classList.toggle('hidden', !loading)
    els.input.disabled = loading
}

// === API ===
const api = {
    async post(endpoint, data) {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    },

    async ensureRoom() {
        const rooms = await fetch(`${API_URL}/rooms`).then(r => r.json())
        if (rooms.length > 0) return rooms[0].id
        
        const room = await this.post('/rooms', {
            title: 'Chika Arena Session',
            active_ais: state.selectedAIs
        })
        return room.id
    },

    async sendMessage(roomId, content) {
        return this.post('/chat', {
            room_id: roomId,
            content,
            preferred_provider: state.selectedAIs[0] || 'claude'
        })
    }
}

// === D3 GRAPH ===
let svg, g, nodeGroup, linkGroup

function initGraph() {
    const width = els.graph.clientWidth
    const height = els.graph.clientHeight

    svg = d3.select('#graph-container')
        .append('svg')
        .attr('width', width)
        .attr('height', height)

    g = svg.append('g')

    // Zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on('zoom', (event) => g.attr('transform', event.transform))
    
    svg.call(zoom)

    linkGroup = g.append('g').attr('class', 'links')
    nodeGroup = g.append('g').attr('class', 'nodes')

    // Force simulation
    state.simulation = d3.forceSimulation()
        .force('link', d3.forceLink().id(d => d.id).distance(150))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(40))
}

function addNode(id, type, content) {
    const existing = state.nodes.find(n => n.id === id)
    if (existing) return existing

    const node = { id, type, content }
    state.nodes.push(node)
    return node
}

function addLink(source, target) {
    const existing = state.links.find(l => 
        l.source.id === source.id && l.target.id === target.id
    )
    if (existing) return

    state.links.push({ source, target })
}

function updateGraph() {
    // Update links
    const link = linkGroup.selectAll('path')
        .data(state.links)
        .join('path')
        .attr('class', 'link')

    // Update nodes
    const node = nodeGroup.selectAll('g')
        .data(state.nodes)
        .join('g')
        .attr('class', d => `node ${d.type}`)
        .call(d3.drag()
            .on('start', dragStarted)
            .on('drag', dragged)
            .on('end', dragEnded))
        .on('click', showNodeDetail)

    node.selectAll('circle').remove()
    node.selectAll('text').remove()

    node.append('circle')
        .attr('r', 30)

    node.append('text')
        .attr('dy', '.35em')
        .text(d => d.type === 'user' ? '👤' : getAIEmoji(d.type))

    // Update simulation
    state.simulation
        .nodes(state.nodes)
        .on('tick', () => {
            link.attr('d', d => {
                const dx = d.target.x - d.source.x
                const dy = d.target.y - d.source.y
                return `M${d.source.x},${d.source.y} L${d.target.x},${d.target.y}`
            })

            node.attr('transform', d => `translate(${d.x},${d.y})`)
        })

    state.simulation.force('link').links(state.links)
    state.simulation.alpha(1).restart()
}

function getAIEmoji(type) {
    const emojis = {
        'claude': '🤖',
        'gpt': '🧠',
        'gemini': '✨',
        'ollama': '🦙'
    }
    return emojis[type] || '🤖'
}

function dragStarted(event, d) {
    if (!event.active) state.simulation.alphaTarget(0.3).restart()
    d.fx = d.x
    d.fy = d.y
}

function dragged(event, d) {
    d.fx = event.x
    d.fy = event.y
}

function dragEnded(event, d) {
    if (!event.active) state.simulation.alphaTarget(0)
    d.fx = null
    d.fy = null
}

function showNodeDetail(event, d) {
    els.detailContent.innerHTML = `
        <h3>${d.type === 'user' ? 'Toi' : d.type.toUpperCase()}</h3>
        <p>${d.content}</p>
    `
    els.detailPanel.classList.remove('hidden')
}

window.closeDetail = () => {
    els.detailPanel.classList.add('hidden')
}

// === CHAT ===
els.form.addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const content = els.input.value.trim()
    if (!content || state.isLoading) return
    
    try {
        setLoading(true)
        
        if (!state.currentRoom) {
            state.currentRoom = await api.ensureRoom()
        }
        
        // Add user node
        const userNode = addNode(`user-${Date.now()}`, 'user', content)
        els.input.value = ''
        
        // Send to API
        const response = await api.sendMessage(state.currentRoom, content)
        
        // Add AI response nodes
        if (response.ai_responses) {
            for (const [aiType, aiResponse] of Object.entries(response.ai_responses)) {
                const aiNode = addNode(`${aiType}-${Date.now()}`, aiType, aiResponse)
                addLink(userNode, aiNode)
            }
        }
        
        updateGraph()
        
    } catch (err) {
        console.error('Chat error:', err)
        showToast(err.message || 'Erreur', 'error')
    } finally {
        setLoading(false)
        els.input.focus()
    }
})

// === AI SELECTION ===
els.aiChips.forEach(chip => {
    chip.addEventListener('click', () => {
        const ai = chip.dataset.ai
        
        if (ai === 'all') {
            state.selectedAIs = ['claude', 'gpt', 'gemini']
            els.aiChips.forEach(c => c.classList.remove('active'))
            chip.classList.add('active')
        } else {
            const allBtn = Array.from(els.aiChips).find(c => c.dataset.ai === 'all')
            allBtn.classList.remove('active')
            
            chip.classList.toggle('active')
            
            const selected = Array.from(els.aiChips)
                .filter(c => c.classList.contains('active') && c.dataset.ai !== 'all')
                .map(c => c.dataset.ai)
            
            state.selectedAIs = selected.length > 0 ? selected : ['claude']
        }
    })
})

// === CONTROLS ===
els.resetBtn.addEventListener('click', () => {
    svg.transition().duration(750).call(
        d3.zoom().transform,
        d3.zoomIdentity
    )
})

els.clearBtn.addEventListener('click', () => {
    if (confirm('Effacer tout le graphe ?')) {
        state.nodes = []
        state.links = []
        updateGraph()
    }
})

// === INIT ===
initGraph()
els.input.focus()
console.log('🎯 Chika Arena initialized')
