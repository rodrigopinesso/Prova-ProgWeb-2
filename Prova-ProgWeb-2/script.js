function formatarData(data) {
    let dataBr = data.toLocaleDateString('pt-BR').split('/')
    let dia = parseInt(dataBr[0]) + 1
    let mes = parseInt(dataBr[1])
    let ano = parseInt(dataBr[2])

    if (dia == 32) {
        dia = 1
        mes++
    }
    if (mes == 13) {
        mes = 1
        ano++
    }
    dia = dia.toString()
    mes = mes.toString()

    if (dia.length == 1) {
        dia = '0' + dia
    }
    if (mes.length == 1) {
        mes = '0' + mes
    }

    let dataFormatada = mes + '-' + dia + '-' + ano
    return dataFormatada
}

function atualizarFiltros(pagina) {
    removerListas()

    let cont = 0

    let tipo = document.querySelector('#tipo')
    let qtd = document.querySelector('#qtd')
    let de = document.querySelector('#de')
    let ate = document.querySelector('#até')
    let busca = document.querySelector('#barraDePesquisa')

    const url = new URL(window.location)
    url.searchParams.delete('busca');
    url.searchParams.delete('tipo');
    url.searchParams.delete('de');
    url.searchParams.delete('ate');
    url.searchParams.delete('page');
    url.searchParams.set('qtd', qtd.value)

    if (tipo.value != '') {
        url.searchParams.set('tipo', tipo.value)
        cont++
    }
    if (qtd.value != 10) {
        cont++
    }
    if (de.value != '') {
        let data = new Date(de.value)
        data = formatarData(data)
        url.searchParams.set('de', data)
        cont++
    }
    if (ate.value != '') {
        let data = new Date(ate.value)
        data = formatarData(data)
        url.searchParams.set('ate', data)
        cont++
    }
    if (pagina != '') {
        url.searchParams.set('page', pagina)
    }
    if (busca.value != '') {
        url.searchParams.set('busca', busca.value)
    }
    document.querySelector('#spanFiltro').textContent = `${cont}`
    window.history.pushState({}, '', url);

    carregarNoticias()
}

function carregarNoticias() {

    const url = new URL(window.location)
    let queryString = url.search
    console.log(queryString, queryString)
    let link = 'https://servicodados.ibge.gov.br/api/v3/noticias/'

    fetch(link + queryString)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na requisição: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log('Página do retorno do fetch: ' + data.page)
            console.log(data)
            adicionarPaginacao(data.page, data.totalPages)
            data.items.forEach(item => {
                let li = document.createElement('li')
                li.id = item.id

                let img = document.createElement('img')
                let imagens = JSON.parse(item.imagens)
                img.src = 'https://agenciadenoticias.ibge.gov.br/' + imagens.image_intro
                li.appendChild(img)

                let div = document.createElement('div')
                let h2 = document.createElement('h2')
                h2.innerText = item.titulo
                div.appendChild(h2)
                let p = document.createElement('p')
                p.classList.add('introducao')
                p.innerText = item.introducao
                div.appendChild(p)
                let divInfoAdicional = document.createElement('div')
                p = document.createElement('p')
                p.innerText = '#' + item.editorias
                divInfoAdicional.appendChild(p)
                p = document.createElement('p')
                p.innerText = 'Publicado ' + calcularDiferenca(item.data_publicacao)
                p.classList.add('data')
                divInfoAdicional.appendChild(p)
                divInfoAdicional.classList.add('infoAdicional')
                div.appendChild(divInfoAdicional)
                let button = document.createElement('button')
                button.innerText = 'Leia mais'
                button.classList.add('botaoLeiaMais')
                button.addEventListener('click', function () {
                    window.open(item.link, '_blank')
                })
                div.appendChild(button)

                li.appendChild(div)

                let lista = document.querySelector('#listaDeNoticias')
                if (lista == null) {
                    lista = document.createElement('ul')
                    lista.id = 'listaDeNoticias'
                    document.querySelector('#conteúdo').appendChild(lista)
                }
                lista.appendChild(li)
                let hr = document.createElement('hr')
                lista.appendChild(hr)
            })
        })
        .catch(error => console.error('Erro:', error));
}

function calcularDiferenca(dataPublicacao) {

    let dataRecebida = new Date(dataPublicacao)
    let dataAtual = new Date()
    let diferenca = dataAtual - dataRecebida
    let dias = Math.floor(diferenca / (1000 * 60 * 60 * 24)) // um dia em milisegundos

    dias = Math.abs(dias)
    anos = Math.floor(dias/365)
    meses = Math.floor(dias%365/30)

    let stringDiferenca = ''

    if (anos >= 1) { // faz mais de 1 ano
        if (anos >= 2) {
            stringDiferenca = 'há ' + anos + ' anos'
        }
        else {
            stringDiferenca = 'há 1 ano'
        }
        if (meses >= 1) {
            if (meses >= 2) {
                stringDiferenca += ' e ' + meses + ' meses'
            }
            else {
                stringDiferenca += ' e 1 mês'
            }
        }
    }
    else if (meses >= 1) { // faz mais de 1 mês
        if (meses >= 2) {
            stringDiferenca = 'há ' + meses + ' meses'
        }
        else {
            stringDiferenca = 'há 1 mês'
        }

        if (dias%365%30 >= 1) { // se não estiver em um 'mêsversário' mostra também os dias
            if (dias%365%30 >= 2) {
                stringDiferenca += ' e ' + (dias%365%30) + ' dias'
            }
            else {
                stringDiferenca += ' e 1 dia'
            }
        }
    }
    else { // faz menos de 1 mês
        if (dias >= 1) {
            if (dias >= 3) {
                stringDiferenca += 'há ' + dias + ' dias'
            }
            else if (dias == 2) {
                stringDiferenca += 'anteontem'
            }
            else {
                stringDiferenca += 'ontem'
            }
        }
        else {
            stringDiferenca += 'hoje'
        }
    }

    return stringDiferenca
}

function adicionarPaginacao(pagina, totalDePaginas) {
    let ul = document.querySelector('#listaDePaginas')

    if (ul == null) {
        ul = document.createElement('ul')
        ul.id = 'listaDePaginas'
        document.querySelector('#paginacao').appendChild(ul)
    }

    let aux = pagina - 5 //
    if (aux < 1) {
        aux = 1
    }

    let li = document.createElement('li')
    let button = document.createElement('button')
    if (pagina != 1) {
        button.addEventListener('click', () => {
            atualizarFiltros(pagina - 1)
        })
    }

    for (let index = 1; index <= 10 && aux <= totalDePaginas; index++) {
        li = document.createElement('li')
        button = document.createElement('button')
        button.innerText = aux
        if (button.innerText == pagina) {
            let paginaAtual = document.querySelector('#paginaAtual')
            if(paginaAtual != null){
                paginaAtual.remove()
            }
            button.id = 'paginaAtual'
        }
        aux++
        if (button.innerText != pagina) {
            let valorDoMomento = button.innerText
            button.addEventListener('click', () => {
                atualizarFiltros(valorDoMomento)
            })
        }
        li.appendChild(button)
        ul.appendChild(li)
    }

    li = document.createElement('li')
    button = document.createElement('button')
    button.addEventListener('click', () => {
        atualizarFiltros(pagina + 1)
    }) 

    if (totalDePaginas == 1) {
        document.querySelector('.setas').remove()
        document.querySelector('.setas').remove()
    }
}

function removerListas() {
    document.querySelector('ul').remove()
    document.querySelector('ul').remove()
}

function openDialog() {
    let dialog = document.querySelector('#dialog')
    dialog.showModal()
}

function closeDialog() {
    let dialog = document.querySelector('#dialog')
    dialog.close()
}