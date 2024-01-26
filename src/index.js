import axios from "axios"
import puppeteer from "puppeteer"

class Parser {
  constructor() {
    this.root = 'https://petrovich.ru'
    this.cookies = {}
    this.axios = axios.create({ baseURL: 'https://api.petrovich.ru' })
    this.cityCode = 'msk'
    this.limit = 20
  }
  async getCookies() {
    const browser = await puppeteer.launch({ headless: false })
    const page = await browser.newPage()
    await page.goto(this.root)
    const cookies = await page.cookies()
    await browser.close()
    this.cookies = cookies.reduce((acc, cur) => {
      acc[cur.name] = cur.value
      return acc
    }, {})
  }

  async fetch({ url, method, params }) {
    const cookiesString = Object.entries(this.cookies).reduce((acc, [key, val]) => {
      acc += key + '=' + val + ';'
      return acc
    }, '')
    return this.axios({
      url,
      method,
      params: { city_code: this.cityCode, ...params },
      headers: `Cookie: ${cookiesString}`,
      withCredentials: true,
    })
  }

  async testFetch() {
    const { data } = await this.fetch({
      url: '/catalog/v4/sections/1384/products',
      method: 'GET',
      params: { limit: this.limit },
    })
    console.dir(data)
  }
}

const parser = new Parser()

parser.getCookies().then(() => parser.testFetch())