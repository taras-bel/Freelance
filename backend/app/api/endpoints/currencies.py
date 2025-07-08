"""
Multi-currency system for the freelance platform.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from decimal import Decimal
import requests
import json

from app.database import get_db
from app.auth import get_current_active_user
from app.schemas import Currency, CurrencyRate, CurrencyConversion
from app.db_models import User

router = APIRouter()

# Supported currencies
SUPPORTED_CURRENCIES = {
    "USD": {"name": "US Dollar", "symbol": "$", "decimals": 2},
    "EUR": {"name": "Euro", "symbol": "€", "decimals": 2},
    "GBP": {"name": "British Pound", "symbol": "£", "decimals": 2},
    "JPY": {"name": "Japanese Yen", "symbol": "¥", "decimals": 0},
    "CAD": {"name": "Canadian Dollar", "symbol": "C$", "decimals": 2},
    "AUD": {"name": "Australian Dollar", "symbol": "A$", "decimals": 2},
    "CHF": {"name": "Swiss Franc", "symbol": "CHF", "decimals": 2},
    "CNY": {"name": "Chinese Yuan", "symbol": "¥", "decimals": 2},
    "INR": {"name": "Indian Rupee", "symbol": "₹", "decimals": 2},
    "BRL": {"name": "Brazilian Real", "symbol": "R$", "decimals": 2},
    "RUB": {"name": "Russian Ruble", "symbol": "₽", "decimals": 2},
    "KRW": {"name": "South Korean Won", "symbol": "₩", "decimals": 0},
    "MXN": {"name": "Mexican Peso", "symbol": "$", "decimals": 2},
    "SGD": {"name": "Singapore Dollar", "symbol": "S$", "decimals": 2},
    "HKD": {"name": "Hong Kong Dollar", "symbol": "HK$", "decimals": 2},
    "NOK": {"name": "Norwegian Krone", "symbol": "kr", "decimals": 2},
    "SEK": {"name": "Swedish Krona", "symbol": "kr", "decimals": 2},
    "DKK": {"name": "Danish Krone", "symbol": "kr", "decimals": 2},
    "PLN": {"name": "Polish Złoty", "symbol": "zł", "decimals": 2},
    "TRY": {"name": "Turkish Lira", "symbol": "₺", "decimals": 2},
    "ZAR": {"name": "South African Rand", "symbol": "R", "decimals": 2},
    "THB": {"name": "Thai Baht", "symbol": "฿", "decimals": 2},
    "MYR": {"name": "Malaysian Ringgit", "symbol": "RM", "decimals": 2},
    "IDR": {"name": "Indonesian Rupiah", "symbol": "Rp", "decimals": 0},
    "PHP": {"name": "Philippine Peso", "symbol": "₱", "decimals": 2},
    "VND": {"name": "Vietnamese Dong", "symbol": "₫", "decimals": 0},
    "EGP": {"name": "Egyptian Pound", "symbol": "E£", "decimals": 2},
    "NGN": {"name": "Nigerian Naira", "symbol": "₦", "decimals": 2},
    "KES": {"name": "Kenyan Shilling", "symbol": "KSh", "decimals": 2},
    "GHS": {"name": "Ghanaian Cedi", "symbol": "GH₵", "decimals": 2},
    "UGX": {"name": "Ugandan Shilling", "symbol": "USh", "decimals": 0},
    "TZS": {"name": "Tanzanian Shilling", "symbol": "TSh", "decimals": 0},
    "ETB": {"name": "Ethiopian Birr", "symbol": "Br", "decimals": 2},
    "MAD": {"name": "Moroccan Dirham", "symbol": "MAD", "decimals": 2},
    "TND": {"name": "Tunisian Dinar", "symbol": "TND", "decimals": 3},
    "JOD": {"name": "Jordanian Dinar", "symbol": "JOD", "decimals": 3},
    "LBP": {"name": "Lebanese Pound", "symbol": "LBP", "decimals": 0},
    "SAR": {"name": "Saudi Riyal", "symbol": "SAR", "decimals": 2},
    "AED": {"name": "UAE Dirham", "symbol": "AED", "decimals": 2},
    "QAR": {"name": "Qatari Riyal", "symbol": "QAR", "decimals": 2},
    "KWD": {"name": "Kuwaiti Dinar", "symbol": "KWD", "decimals": 3},
    "BHD": {"name": "Bahraini Dinar", "symbol": "BHD", "decimals": 3},
    "OMR": {"name": "Omani Rial", "symbol": "OMR", "decimals": 3},
    "ILS": {"name": "Israeli Shekel", "symbol": "₪", "decimals": 2},
    "CLP": {"name": "Chilean Peso", "symbol": "$", "decimals": 0},
    "COP": {"name": "Colombian Peso", "symbol": "$", "decimals": 0},
    "PEN": {"name": "Peruvian Sol", "symbol": "S/", "decimals": 2},
    "ARS": {"name": "Argentine Peso", "symbol": "$", "decimals": 2},
    "UYU": {"name": "Uruguayan Peso", "symbol": "$", "decimals": 2},
    "PYG": {"name": "Paraguayan Guaraní", "symbol": "₲", "decimals": 0},
    "BOB": {"name": "Bolivian Boliviano", "symbol": "Bs", "decimals": 2},
    "CRC": {"name": "Costa Rican Colón", "symbol": "₡", "decimals": 0},
    "GTQ": {"name": "Guatemalan Quetzal", "symbol": "Q", "decimals": 2},
    "HNL": {"name": "Honduran Lempira", "symbol": "L", "decimals": 2},
    "NIO": {"name": "Nicaraguan Córdoba", "symbol": "C$", "decimals": 2},
    "PAB": {"name": "Panamanian Balboa", "symbol": "B/.", "decimals": 2},
    "DOP": {"name": "Dominican Peso", "symbol": "$", "decimals": 2},
    "JMD": {"name": "Jamaican Dollar", "symbol": "$", "decimals": 2},
    "TTD": {"name": "Trinidad and Tobago Dollar", "symbol": "$", "decimals": 2},
    "BBD": {"name": "Barbadian Dollar", "symbol": "$", "decimals": 2},
    "XCD": {"name": "East Caribbean Dollar", "symbol": "$", "decimals": 2},
    "BZD": {"name": "Belize Dollar", "symbol": "$", "decimals": 2},
    "GYD": {"name": "Guyanese Dollar", "symbol": "$", "decimals": 2},
    "SRD": {"name": "Surinamese Dollar", "symbol": "$", "decimals": 2},
    "FJD": {"name": "Fijian Dollar", "symbol": "$", "decimals": 2},
    "NZD": {"name": "New Zealand Dollar", "symbol": "$", "decimals": 2},
    "PGK": {"name": "Papua New Guinean Kina", "symbol": "K", "decimals": 2},
    "SBD": {"name": "Solomon Islands Dollar", "symbol": "$", "decimals": 2},
    "VUV": {"name": "Vanuatu Vatu", "symbol": "VT", "decimals": 0},
    "WST": {"name": "Samoan Tālā", "symbol": "T", "decimals": 2},
    "TOP": {"name": "Tongan Paʻanga", "symbol": "T$", "decimals": 2},
    "KID": {"name": "Kiribati Dollar", "symbol": "$", "decimals": 2},
    "CZK": {"name": "Czech Koruna", "symbol": "Kč", "decimals": 2},
    "HUF": {"name": "Hungarian Forint", "symbol": "Ft", "decimals": 0},
    "RON": {"name": "Romanian Leu", "symbol": "lei", "decimals": 2},
    "BGN": {"name": "Bulgarian Lev", "symbol": "лв", "decimals": 2},
    "HRK": {"name": "Croatian Kuna", "symbol": "kn", "decimals": 2},
    "RSD": {"name": "Serbian Dinar", "symbol": "дин", "decimals": 0},
    "ALL": {"name": "Albanian Lek", "symbol": "L", "decimals": 0},
    "MKD": {"name": "Macedonian Denar", "symbol": "ден", "decimals": 0},
    "BAM": {"name": "Bosnia-Herzegovina Convertible Mark", "symbol": "KM", "decimals": 2},
    "MDL": {"name": "Moldovan Leu", "symbol": "L", "decimals": 2},
    "GEL": {"name": "Georgian Lari", "symbol": "₾", "decimals": 2},
    "AMD": {"name": "Armenian Dram", "symbol": "֏", "decimals": 0},
    "AZN": {"name": "Azerbaijani Manat", "symbol": "₼", "decimals": 2},
    "BYN": {"name": "Belarusian Ruble", "symbol": "Br", "decimals": 2},
    "KZT": {"name": "Kazakhstani Tenge", "symbol": "₸", "decimals": 2},
    "KGS": {"name": "Kyrgyzstani Som", "symbol": "с", "decimals": 2},
    "TJS": {"name": "Tajikistani Somoni", "symbol": "ЅM", "decimals": 2},
    "TMT": {"name": "Turkmenistani Manat", "symbol": "T", "decimals": 2},
    "UZS": {"name": "Uzbekistani Som", "symbol": "so'm", "decimals": 0},
    "MNT": {"name": "Mongolian Tögrög", "symbol": "₮", "decimals": 0},
    "LAK": {"name": "Lao Kip", "symbol": "₭", "decimals": 0},
    "MMK": {"name": "Myanmar Kyat", "symbol": "K", "decimals": 0},
    "KHR": {"name": "Cambodian Riel", "symbol": "៛", "decimals": 0},
    "BDT": {"name": "Bangladeshi Taka", "symbol": "৳", "decimals": 2},
    "LKR": {"name": "Sri Lankan Rupee", "symbol": "Rs", "decimals": 2},
    "NPR": {"name": "Nepalese Rupee", "symbol": "₨", "decimals": 2},
    "PKR": {"name": "Pakistani Rupee", "symbol": "₨", "decimals": 0},
    "AFN": {"name": "Afghan Afghani", "symbol": "؋", "decimals": 0},
    "IRR": {"name": "Iranian Rial", "symbol": "﷼", "decimals": 0},
    "IQD": {"name": "Iraqi Dinar", "symbol": "ع.د", "decimals": 0},
    "SYP": {"name": "Syrian Pound", "symbol": "£", "decimals": 0},
    "YER": {"name": "Yemeni Rial", "symbol": "﷼", "decimals": 0},
    "LYD": {"name": "Libyan Dinar", "symbol": "ل.د", "decimals": 3},
    "SDG": {"name": "Sudanese Pound", "symbol": "ج.س", "decimals": 2},
    "SSP": {"name": "South Sudanese Pound", "symbol": "£", "decimals": 2},
    "DJF": {"name": "Djiboutian Franc", "symbol": "Fdj", "decimals": 0},
    "SOS": {"name": "Somali Shilling", "symbol": "S", "decimals": 0},
    "SLL": {"name": "Sierra Leonean Leone", "symbol": "Le", "decimals": 0},
    "GMD": {"name": "Gambian Dalasi", "symbol": "D", "decimals": 2},
    "GNF": {"name": "Guinean Franc", "symbol": "FG", "decimals": 0},
    "XOF": {"name": "West African CFA Franc", "symbol": "CFA", "decimals": 0},
    "XAF": {"name": "Central African CFA Franc", "symbol": "FCFA", "decimals": 0},
    "XPF": {"name": "CFP Franc", "symbol": "₣", "decimals": 0},
    "CDF": {"name": "Congolese Franc", "symbol": "FC", "decimals": 0},
    "RWF": {"name": "Rwandan Franc", "symbol": "FRw", "decimals": 0},
    "BIF": {"name": "Burundian Franc", "symbol": "FBu", "decimals": 0},
    "MWK": {"name": "Malawian Kwacha", "symbol": "MK", "decimals": 0},
    "ZMW": {"name": "Zambian Kwacha", "symbol": "ZK", "decimals": 0},
    "ZWL": {"name": "Zimbabwean Dollar", "symbol": "$", "decimals": 2},
    "NAD": {"name": "Namibian Dollar", "symbol": "$", "decimals": 2},
    "BWP": {"name": "Botswana Pula", "symbol": "P", "decimals": 2},
    "LSL": {"name": "Lesotho Loti", "symbol": "L", "decimals": 2},
    "SZL": {"name": "Eswatini Lilangeni", "symbol": "L", "decimals": 2},
    "MUR": {"name": "Mauritian Rupee", "symbol": "₨", "decimals": 0},
    "SCR": {"name": "Seychellois Rupee", "symbol": "₨", "decimals": 0},
    "MVR": {"name": "Maldivian Rufiyaa", "symbol": "Rf", "decimals": 2},
    "BTN": {"name": "Bhutanese Ngultrum", "symbol": "Nu.", "decimals": 2},
    "MOP": {"name": "Macanese Pataca", "symbol": "MOP$", "decimals": 2},
    "TWD": {"name": "New Taiwan Dollar", "symbol": "NT$", "decimals": 0},
    "KYD": {"name": "Cayman Islands Dollar", "symbol": "$", "decimals": 2},
    "BMD": {"name": "Bermudian Dollar", "symbol": "$", "decimals": 2},
    "BND": {"name": "Brunei Dollar", "symbol": "$", "decimals": 2},
    "ISK": {"name": "Icelandic Króna", "symbol": "kr", "decimals": 0},
    "FKP": {"name": "Falkland Islands Pound", "symbol": "£", "decimals": 2},
    "GIP": {"name": "Gibraltar Pound", "symbol": "£", "decimals": 2},
    "SHP": {"name": "Saint Helena Pound", "symbol": "£", "decimals": 2},
    "JEP": {"name": "Jersey Pound", "symbol": "£", "decimals": 2},
    "GGP": {"name": "Guernsey Pound", "symbol": "£", "decimals": 2},
    "IMP": {"name": "Manx Pound", "symbol": "£", "decimals": 2},
    "ANG": {"name": "Netherlands Antillean Guilder", "symbol": "ƒ", "decimals": 2},
    "AWG": {"name": "Aruban Florin", "symbol": "ƒ", "decimals": 2},
    "CUC": {"name": "Cuban Convertible Peso", "symbol": "$", "decimals": 2},
    "CUP": {"name": "Cuban Peso", "symbol": "$", "decimals": 2},
    "HTG": {"name": "Haitian Gourde", "symbol": "G", "decimals": 2},
    "GYD": {"name": "Guyanese Dollar", "symbol": "$", "decimals": 2},
    "SRD": {"name": "Surinamese Dollar", "symbol": "$", "decimals": 2},
    "VES": {"name": "Venezuelan Bolívar", "symbol": "Bs", "decimals": 2},
    "VED": {"name": "Venezuelan Bolívar Digital", "symbol": "Bs", "decimals": 2},
    "XBT": {"name": "Bitcoin", "symbol": "₿", "decimals": 8},
    "ETH": {"name": "Ethereum", "symbol": "Ξ", "decimals": 18},
    "USDT": {"name": "Tether", "symbol": "₮", "decimals": 6},
    "USDC": {"name": "USD Coin", "symbol": "$", "decimals": 6},
    "BNB": {"name": "Binance Coin", "symbol": "BNB", "decimals": 8},
    "ADA": {"name": "Cardano", "symbol": "₳", "decimals": 6},
    "SOL": {"name": "Solana", "symbol": "◎", "decimals": 9},
    "DOT": {"name": "Polkadot", "symbol": "DOT", "decimals": 10},
    "MATIC": {"name": "Polygon", "symbol": "MATIC", "decimals": 18},
    "LINK": {"name": "Chainlink", "symbol": "LINK", "decimals": 18},
    "UNI": {"name": "Uniswap", "symbol": "UNI", "decimals": 18},
    "AVAX": {"name": "Avalanche", "symbol": "AVAX", "decimals": 18},
    "ATOM": {"name": "Cosmos", "symbol": "ATOM", "decimals": 6},
    "LTC": {"name": "Litecoin", "symbol": "Ł", "decimals": 8},
    "BCH": {"name": "Bitcoin Cash", "symbol": "BCH", "decimals": 8},
    "XRP": {"name": "Ripple", "symbol": "XRP", "decimals": 6},
    "DOGE": {"name": "Dogecoin", "symbol": "Ð", "decimals": 8},
    "SHIB": {"name": "Shiba Inu", "symbol": "SHIB", "decimals": 18},
    "TRX": {"name": "TRON", "symbol": "TRX", "decimals": 6},
    "EOS": {"name": "EOS", "symbol": "EOS", "decimals": 4},
    "NEO": {"name": "NEO", "symbol": "NEO", "decimals": 8},
    "XLM": {"name": "Stellar", "symbol": "XLM", "decimals": 7},
    "VET": {"name": "VeChain", "symbol": "VET", "decimals": 18},
    "THETA": {"name": "Theta", "symbol": "THETA", "decimals": 6},
    "FIL": {"name": "Filecoin", "symbol": "FIL", "decimals": 18},
    "ICP": {"name": "Internet Computer", "symbol": "ICP", "decimals": 8},
    "ALGO": {"name": "Algorand", "symbol": "ALGO", "decimals": 6},
    "FTM": {"name": "Fantom", "symbol": "FTM", "decimals": 18},
    "NEAR": {"name": "NEAR Protocol", "symbol": "NEAR", "decimals": 24},
    "AR": {"name": "Arweave", "symbol": "AR", "decimals": 12},
    "FLOW": {"name": "Flow", "symbol": "FLOW", "decimals": 8},
    "AUDIO": {"name": "Audius", "symbol": "AUDIO", "decimals": 18},
    "REN": {"name": "Ren", "symbol": "REN", "decimals": 18},
    "ZEC": {"name": "Zcash", "symbol": "ZEC", "decimals": 8},
    "DASH": {"name": "Dash", "symbol": "DASH", "decimals": 8},
    "XMR": {"name": "Monero", "symbol": "XMR", "decimals": 12},
    "ZEN": {"name": "Horizen", "symbol": "ZEN", "decimals": 8},
    "RVN": {"name": "Ravencoin", "symbol": "RVN", "decimals": 8},
    "GRT": {"name": "The Graph", "symbol": "GRT", "decimals": 18},
    "AAVE": {"name": "Aave", "symbol": "AAVE", "decimals": 18},
    "COMP": {"name": "Compound", "symbol": "COMP", "decimals": 18},
    "MKR": {"name": "Maker", "symbol": "MKR", "decimals": 18},
    "YFI": {"name": "yearn.finance", "symbol": "YFI", "decimals": 18},
    "SUSHI": {"name": "SushiSwap", "symbol": "SUSHI", "decimals": 18},
    "CRV": {"name": "Curve DAO Token", "symbol": "CRV", "decimals": 18},
    "BAL": {"name": "Balancer", "symbol": "BAL", "decimals": 18},
    "SNX": {"name": "Synthetix", "symbol": "SNX", "decimals": 18},
    "UMA": {"name": "UMA", "symbol": "UMA", "decimals": 18},
    "BAND": {"name": "Band Protocol", "symbol": "BAND", "decimals": 18},
    "NMR": {"name": "Numeraire", "symbol": "NMR", "decimals": 18},
    "REP": {"name": "Augur", "symbol": "REP", "decimals": 18},
    "BAT": {"name": "Basic Attention Token", "symbol": "BAT", "decimals": 18},
    "ENJ": {"name": "Enjin Coin", "symbol": "ENJ", "decimals": 18},
    "MANA": {"name": "Decentraland", "symbol": "MANA", "decimals": 18},
    "SAND": {"name": "The Sandbox", "symbol": "SAND", "decimals": 18},
    "AXS": {"name": "Axie Infinity", "symbol": "AXS", "decimals": 18},
    "CHZ": {"name": "Chiliz", "symbol": "CHZ", "decimals": 18},
    "HOT": {"name": "Holo", "symbol": "HOT", "decimals": 18},
    "IOTA": {"name": "IOTA", "symbol": "MIOTA", "decimals": 6},
    "NANO": {"name": "Nano", "symbol": "XNO", "decimals": 30},
    "HBAR": {"name": "Hedera", "symbol": "HBAR", "decimals": 8},
    "ONE": {"name": "Harmony", "symbol": "ONE", "decimals": 18},
    "IOTX": {"name": "IoTeX", "symbol": "IOTX", "decimals": 18},
    "QTUM": {"name": "Qtum", "symbol": "QTUM", "decimals": 8},
    "WAVES": {"name": "Waves", "symbol": "WAVES", "decimals": 8},
    "XTZ": {"name": "Tezos", "symbol": "XTZ", "decimals": 6},
    "ALGO": {"name": "Algorand", "symbol": "ALGO", "decimals": 6},
    "VET": {"name": "VeChain", "symbol": "VET", "decimals": 18},
    "ICX": {"name": "ICON", "symbol": "ICX", "decimals": 18},
    "ZIL": {"name": "Zilliqa", "symbol": "ZIL", "decimals": 12},
    "ONT": {"name": "Ontology", "symbol": "ONT", "decimals": 8},
    "NULS": {"name": "NULS", "symbol": "NULS", "decimals": 8},
    "WTC": {"name": "Waltonchain", "symbol": "WTC", "decimals": 18},
    "ELA": {"name": "Elastos", "symbol": "ELA", "decimals": 8},
    "NAS": {"name": "Nebulas", "symbol": "NAS", "decimals": 18},
    "GXC": {"name": "GXChain", "symbol": "GXC", "decimals": 8},
    "MCO": {"name": "Crypto.com", "symbol": "MCO", "decimals": 8},
    "CRO": {"name": "Cronos", "symbol": "CRO", "decimals": 8},
    "KCS": {"name": "KuCoin Token", "symbol": "KCS", "decimals": 6},
    "BNT": {"name": "Bancor", "symbol": "BNT", "decimals": 18},
    "KNC": {"name": "Kyber Network", "symbol": "KNC", "decimals": 18},
    "ZRX": {"name": "0x", "symbol": "ZRX", "decimals": 18},
    "OMG": {"name": "OMG Network", "symbol": "OMG", "decimals": 18},
    "LRC": {"name": "Loopring", "symbol": "LRC", "decimals": 18},
    "STORJ": {"name": "Storj", "symbol": "STORJ", "decimals": 8},
    "SC": {"name": "Siacoin", "symbol": "SC", "decimals": 6},
    "MAID": {"name": "MaidSafeCoin", "symbol": "MAID", "decimals": 18},
    "GNT": {"name": "Golem", "symbol": "GNT", "decimals": 18},
    "REQ": {"name": "Request", "symbol": "REQ", "decimals": 18},
    "FUN": {"name": "FunFair", "symbol": "FUN", "decimals": 8},
    "POWR": {"name": "Power Ledger", "symbol": "POWR", "decimals": 6},
    "SUB": {"name": "Substratum", "symbol": "SUB", "decimals": 8},
    "CVC": {"name": "Civic", "symbol": "CVC", "decimals": 8},
    "DNT": {"name": "district0x", "symbol": "DNT", "decimals": 18},
    "MANA": {"name": "Decentraland", "symbol": "MANA", "decimals": 18},
    "SAND": {"name": "The Sandbox", "symbol": "SAND", "decimals": 18},
    "AXS": {"name": "Axie Infinity", "symbol": "AXS", "decimals": 18},
    "CHZ": {"name": "Chiliz", "symbol": "CHZ", "decimals": 18},
    "HOT": {"name": "Holo", "symbol": "HOT", "decimals": 18},
    "IOTA": {"name": "IOTA", "symbol": "MIOTA", "decimals": 6},
    "NANO": {"name": "Nano", "symbol": "XNO", "decimals": 30},
    "HBAR": {"name": "Hedera", "symbol": "HBAR", "decimals": 8},
    "ONE": {"name": "Harmony", "symbol": "ONE", "decimals": 18},
    "IOTX": {"name": "IoTeX", "symbol": "IOTX", "decimals": 18},
    "QTUM": {"name": "Qtum", "symbol": "QTUM", "decimals": 8},
    "WAVES": {"name": "Waves", "symbol": "WAVES", "decimals": 8},
    "XTZ": {"name": "Tezos", "symbol": "XTZ", "decimals": 6},
    "ALGO": {"name": "Algorand", "symbol": "ALGO", "decimals": 6},
    "VET": {"name": "VeChain", "symbol": "VET", "decimals": 18},
    "ICX": {"name": "ICON", "symbol": "ICX", "decimals": 18},
    "ZIL": {"name": "Zilliqa", "symbol": "ZIL", "decimals": 12},
    "ONT": {"name": "Ontology", "symbol": "ONT", "decimals": 8},
    "NULS": {"name": "NULS", "symbol": "NULS", "decimals": 8},
    "WTC": {"name": "Waltonchain", "symbol": "WTC", "decimals": 18},
    "ELA": {"name": "Elastos", "symbol": "ELA", "decimals": 8},
    "NAS": {"name": "Nebulas", "symbol": "NAS", "decimals": 18},
    "GXC": {"name": "GXChain", "symbol": "GXC", "decimals": 8},
    "MCO": {"name": "Crypto.com", "symbol": "MCO", "decimals": 8},
    "CRO": {"name": "Cronos", "symbol": "CRO", "decimals": 8},
    "KCS": {"name": "KuCoin Token", "symbol": "KCS", "decimals": 6},
    "BNT": {"name": "Bancor", "symbol": "BNT", "decimals": 18},
    "KNC": {"name": "Kyber Network", "symbol": "KNC", "decimals": 18},
    "ZRX": {"name": "0x", "symbol": "ZRX", "decimals": 18},
    "OMG": {"name": "OMG Network", "symbol": "OMG", "decimals": 18},
    "LRC": {"name": "Loopring", "symbol": "LRC", "decimals": 18},
    "STORJ": {"name": "Storj", "symbol": "STORJ", "decimals": 8},
    "SC": {"name": "Siacoin", "symbol": "SC", "decimals": 6},
    "MAID": {"name": "MaidSafeCoin", "symbol": "MAID", "decimals": 18},
    "GNT": {"name": "Golem", "symbol": "GNT", "decimals": 18},
    "REQ": {"name": "Request", "symbol": "REQ", "decimals": 18},
    "FUN": {"name": "FunFair", "symbol": "FUN", "decimals": 8},
    "POWR": {"name": "Power Ledger", "symbol": "POWR", "decimals": 6},
    "SUB": {"name": "Substratum", "symbol": "SUB", "decimals": 8},
    "CVC": {"name": "Civic", "symbol": "CVC", "decimals": 8},
    "DNT": {"name": "district0x", "symbol": "DNT", "decimals": 18},
}

# Cache for exchange rates (in production, use Redis)
exchange_rates_cache = {}
last_update = None
CACHE_DURATION = timedelta(hours=1)


@router.get("/", response_model=List[Currency])
def get_supported_currencies(
    current_user: User = Depends(get_current_active_user)
):
    """Get list of supported currencies."""
    currencies = []
    for code, info in SUPPORTED_CURRENCIES.items():
        currencies.append(Currency(
            code=code,
            name=info["name"],
            symbol=info["symbol"],
            decimals=info["decimals"]
        ))
    return currencies


@router.get("/rates", response_model=Dict[str, float])
def get_exchange_rates(
    base_currency: str = Query("USD", description="Base currency for rates"),
    current_user: User = Depends(get_current_active_user)
):
    """Get current exchange rates for all supported currencies."""
    global exchange_rates_cache, last_update
    
    # Check if cache is still valid
    if (last_update and datetime.utcnow() - last_update < CACHE_DURATION and 
        base_currency in exchange_rates_cache):
        return exchange_rates_cache[base_currency]
    
    try:
        # In production, use a real exchange rate API
        # For now, we'll use mock data
        rates = {}
        for code in SUPPORTED_CURRENCIES.keys():
            if code == base_currency:
                rates[code] = 1.0
            else:
                # Mock rates - in production, fetch from API
                import random
                rates[code] = round(random.uniform(0.1, 10.0), 6)
        
        # Cache the rates
        exchange_rates_cache[base_currency] = rates
        last_update = datetime.utcnow()
        
        return rates
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch exchange rates: {str(e)}"
        )


@router.post("/convert", response_model=CurrencyConversion)
def convert_currency(
    amount: Decimal,
    from_currency: str,
    to_currency: str,
    current_user: User = Depends(get_current_active_user)
):
    """Convert amount from one currency to another."""
    # Validate currencies
    if from_currency not in SUPPORTED_CURRENCIES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported currency: {from_currency}"
        )
    
    if to_currency not in SUPPORTED_CURRENCIES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported currency: {to_currency}"
        )
    
    try:
        # Get exchange rates
        rates = get_exchange_rates(from_currency, current_user)
        rate = rates.get(to_currency, 1.0)
        
        # Convert amount
        converted_amount = amount * Decimal(str(rate))
        
        return CurrencyConversion(
            original_amount=amount,
            original_currency=from_currency,
            converted_amount=converted_amount,
            target_currency=to_currency,
            exchange_rate=Decimal(str(rate)),
            converted_at=datetime.utcnow()
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Conversion failed: {str(e)}"
        )


@router.get("/popular", response_model=List[Currency])
def get_popular_currencies(
    current_user: User = Depends(get_current_active_user)
):
    """Get list of most popular currencies."""
    popular_codes = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "INR", "BRL"]
    currencies = []
    
    for code in popular_codes:
        if code in SUPPORTED_CURRENCIES:
            info = SUPPORTED_CURRENCIES[code]
            currencies.append(Currency(
                code=code,
                name=info["name"],
                symbol=info["symbol"],
                decimals=info["decimals"]
            ))
    
    return currencies


@router.get("/crypto", response_model=List[Currency])
def get_cryptocurrencies(
    current_user: User = Depends(get_current_active_user)
):
    """Get list of supported cryptocurrencies."""
    crypto_codes = [
        "XBT", "ETH", "USDT", "USDC", "BNB", "ADA", "SOL", "DOT", "MATIC", 
        "LINK", "UNI", "AVAX", "ATOM", "LTC", "BCH", "XRP", "DOGE", "SHIB"
    ]
    currencies = []
    
    for code in crypto_codes:
        if code in SUPPORTED_CURRENCIES:
            info = SUPPORTED_CURRENCIES[code]
            currencies.append(Currency(
                code=code,
                name=info["name"],
                symbol=info["symbol"],
                decimals=info["decimals"]
            ))
    
    return currencies


@router.get("/fiat", response_model=List[Currency])
def get_fiat_currencies(
    current_user: User = Depends(get_current_active_user)
):
    """Get list of supported fiat currencies."""
    fiat_currencies = []
    
    for code, info in SUPPORTED_CURRENCIES.items():
        # Exclude cryptocurrencies (codes starting with X or common crypto codes)
        if not (code.startswith('X') and len(code) == 3) and code not in [
            "XBT", "ETH", "USDT", "USDC", "BNB", "ADA", "SOL", "DOT", "MATIC", 
            "LINK", "UNI", "AVAX", "ATOM", "LTC", "BCH", "XRP", "DOGE", "SHIB"
        ]:
            fiat_currencies.append(Currency(
                code=code,
                name=info["name"],
                symbol=info["symbol"],
                decimals=info["decimals"]
            ))
    
    return fiat_currencies


@router.get("/info/{currency_code}", response_model=Currency)
def get_currency_info(
    currency_code: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get detailed information about a specific currency."""
    if currency_code not in SUPPORTED_CURRENCIES:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Currency not found: {currency_code}"
        )
    
    info = SUPPORTED_CURRENCIES[currency_code]
    return Currency(
        code=currency_code,
        name=info["name"],
        symbol=info["symbol"],
        decimals=info["decimals"]
    ) 