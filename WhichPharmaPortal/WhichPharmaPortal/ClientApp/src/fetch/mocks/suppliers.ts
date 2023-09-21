import { Supplier } from '../../models/Supplier';
import { SupplierState } from '../../models/SupplierState';
import { SupplierType } from '../../models/SupplierType';
import { SearchResult } from '../../models/SearchResult';

export const suppliers: SearchResult<Supplier> = {
    total: 500,
    timeInSeconds: 0.58,
    items: [
        {
          id: "5f44fe28dfd6c89e1b17197c",
          name: "EuroMedic",
          type: SupplierType.Wholesaler,
          country: "Belgium",
          countryCode: "BE",
          isEurope: true,
          classification: 1,
          notes: "",
          contacts: [
            {
              name: "Gunnar Claeys",
              email: "gunnar.claeys@euro-medic.be",
              isStared: true
            },
            {
              name: "Piet Uydens",
              email: "piet.uydens@euro-medic.be",
              isStared: false
            }
          ],
          state: SupplierState.Others,
          lastVerification: "0001-01-01T00:00:00",
          expirationDate: "0001-01-01T00:00:00",
          creationDate: "2017-06-03T15:21:30.122Z"
        },
        {
          id: "5f44fe28dfd6c89e1b1719a8",
          name: "Diprophar S.A.",
          type: SupplierType.Wholesaler,
          country: "Belgium",
          countryCode: "BE",
          isEurope: true,
          classification: 1,
          notes: "Acesso a radiofármacos, hemoderivados e DM.\nDe acordo com o Mathieu, não têm permissão para abrir links externos por razões de segurança (26/07/2022).",
          contacts: [
            {
              name: "Mathieu Graitson",
              email: "m.graitson@diprophar.com",
              isStared: true
            },
            {
              name: "Katty Counet",
              email: "k.counet@diprophar.com",
              isStared: false
            }
          ],
          state: SupplierState.Qualified,
          lastVerification: "0001-01-01T00:00:00",
          expirationDate: "0001-01-01T00:00:00",
          creationDate: "2017-06-03T15:21:34.2Z"
        },
        {
          id: "5f44fe28dfd6c89e1b1719e6",
          name: "Neuapharma",
          type: SupplierType.Wholesaler,
          country: "Belgium",
          countryCode: "BE",
          isEurope: true,
          classification: 0,
          notes: "sem contacto",
          contacts: [],
          state: SupplierState.Others,
          lastVerification: "0001-01-01T00:00:00",
          expirationDate: "0001-01-01T00:00:00",
          creationDate: "2017-06-03T15:21:39.758Z"
        },
        {
          id: "5f44fe28dfd6c89e1b1719fe",
          name: "Alpha Zeta",
          type: SupplierType.Wholesaler,
          country: "Belgium",
          countryCode: "BE",
          isEurope: true,
          classification: 3,
          notes: "",
          contacts: [
            {
              name: "Sabine de Rocer",
              email: "sabine@alpha-zeta.be",
              isStared: true
            }
          ],
          state: SupplierState.New,
          lastVerification: "0001-01-01T00:00:00",
          expirationDate: "0001-01-01T00:00:00",
          creationDate: "2017-06-03T15:21:41.772Z"
        },
        {
          id: "5f44fe2adfd6c89e1b171bec",
          name: "Medisale",
          type: SupplierType.Wholesaler,
          country: "Belgium",
          countryCode: "BE",
          isEurope: true,
          classification: 3,
          notes: "DM (For wound care we do have good suppliers already. It’s just Hospital that we are starting with. )",
          contacts: [
            {
              name: "An",
              email: "adlr@medisale.be",
              isStared: true
            },
            {
              name: "",
              email: "adc@medisale.be",
              isStared: false
            },
            {
              name: "",
              email: "info@medisale.be",
              isStared: false
            }
          ],
          state: SupplierState.Others,
          lastVerification: "0001-01-01T00:00:00",
          expirationDate: "0001-01-01T00:00:00",
          creationDate: "2019-05-10T14:29:28.898Z"
        },
        {
          id: "5f44fe2adfd6c89e1b171c6e",
          name: "Neogen",
          type: SupplierType.Manufacturer,
          country: "Belgium",
          countryCode: "BE",
          isEurope: true,
          classification: 0,
          notes: "Reunimos na Europlx Nov/2019",
          contacts: [],
          state: SupplierState.Others,
          lastVerification: "0001-01-01T00:00:00",
          expirationDate: "0001-01-01T00:00:00",
          creationDate: "2020-07-09T12:33:39.277Z"
        },
        {
          id: "5f44fe2adfd6c89e1b171c9e",
          name: "Sterop Laboratoires SA",
          type: SupplierType.Manufacturer,
          country: "Belgium",
          countryCode: "BE",
          isEurope: true,
          classification: 3,
          notes: "",
          contacts: [
            {
              name: "Vanessa Menendez",
              email: "export@sterop.be",
              isStared: true
            },
            {
              name: "Sophie Eykerman",
              email: "seykerman@sterop.be",
              isStared: false
            }
          ],
          state: SupplierState.Others,
          lastVerification: "0001-01-01T00:00:00",
          expirationDate: "0001-01-01T00:00:00",
          creationDate: "2018-11-27T12:35:19.078Z"
        },
        {
          id: "5f44fe2adfd6c89e1b171cc2",
          name: "Dafra Pharma",
          type: SupplierType.Manufacturer,
          country: "Belgium",
          countryCode: "BE",
          isEurope: true,
          classification: 0,
          notes: "",
          contacts: [],
          state: SupplierState.Others,
          lastVerification: "0001-01-01T00:00:00",
          expirationDate: "0001-01-01T00:00:00",
          creationDate: "2019-05-07T07:21:24.607Z"
        },
        {
          id: "5fb251861c0c5608275b946c",
          name: "RB PHARMA (BE)",
          type: SupplierType.Manufacturer,
          country: "Belgium",
          countryCode: "BE",
          isEurope: true,
          classification: 3,
          notes: "",
          contacts: [
            {
              name: "procurement",
              email: "procurement@rbpharma.pt",
              isStared: true
            }
          ],
          state: SupplierState.Others,
          lastVerification: "2035-12-31T12:00:00Z",
          expirationDate: "0001-01-01T00:00:00",
          creationDate: "2020-11-16T09:43:32.906Z"
        },
        {
          id: "63565c86b1d91f7fa0619d4a",
          name: "Beldimed",
          type: SupplierType.Wholesaler,
          country: "Belgium",
          countryCode: "BE",
          isEurope: true,
          classification: 0,
          notes: "EXPOPHARM 2022",
          contacts: [
            {
              name: "Pierre  Lahaye",
              email: "pierre@beldimed.com",
              isStared: true
            },
            {
              name: "Agnelo Andrade",
              email: "agnelo@beldimed.com",
              isStared: false
            }
          ],
          state: SupplierState.New,
          lastVerification: "0001-01-01T00:00:00",
          expirationDate: "0001-01-01T00:00:00",
          creationDate: "2022-09-26T06:45:53.253Z"
        },
        {
          id: "63565c96b1d91f7fa0619e04",
          name: "Delta Pharma",
          type: SupplierType.Manufacturer,
          country: "Belgium",
          countryCode: "BE",
          isEurope: true,
          classification: 2,
          notes: "portfolio diversificado",
          contacts: [
            {
              name: "\nJoost Willebrords",
              email: "joost.willebrords@delta-pharma.eu",
              isStared: true
            },
            {
              name: "Tim Schuyten",
              email: "tim.schuyten@delta-pharma.eu",
              isStared: false
            },
            {
              name: "Alex Caldarusa",
              email: "alex.caldarusa@delta-pharma.eu",
              isStared: false
            }
          ],
          state: SupplierState.Qualified,
          lastVerification: "0001-01-01T00:00:00",
          expirationDate: "0001-01-01T00:00:00",
          creationDate: "2022-04-01T13:15:13.653Z"
        },
        {
          id: "63565ca3b1d91f7fa0619e77",
          name: "Medilog",
          type: SupplierType.Manufacturer,
          country: "Belgium",
          countryCode: "BE",
          isEurope: true,
          classification: 0,
          notes: "",
          contacts: [
            {
              name: "",
              email: "info@medilog.be",
              isStared: false
            }
          ],
          state: SupplierState.New,
          lastVerification: "0001-01-01T00:00:00",
          expirationDate: "0001-01-01T00:00:00",
          creationDate: "2022-01-25T15:03:27.541Z"
        },
        {
          id: "63565ca3b1d91f7fa0619e79",
          name: "Clinigen",
          type: SupplierType.Wholesaler,
          country: "Belgium",
          countryCode: "BE",
          isEurope: false,
          classification: 0,
          notes: "Concorrentes para alguns produtos, mas fornecem cotações",
          contacts: [
            {
              name: "Bruno Ribeiro",
              email: "bruno.ribeiro@clinigengroup.com",
              isStared: false
            },
            {
              name: "",
              email: "clinigen_ci@mailgb.custhelp.com",
              isStared: false
            }
          ],
          state: SupplierState.New,
          lastVerification: "0001-01-01T00:00:00",
          expirationDate: "0001-01-01T00:00:00",
          creationDate: "2022-01-20T11:42:29.023Z"
        },
        {
          "id":"5f44fe29dfd6c89e1b171b2c",
          "name":"Udifar",
          "type":SupplierType.Wholesaler,
          "country":"Portugal",
          "countryCode":"PT",
          "isEurope":true,
          "classification":0,
          "notes":"19/06/2020 - A Udifar já não existe nem este contacto está activo. A Udifar faz parte da empresa Plural agora.\n\n02/04/2020: Em relação ao pedido de cotação, neste momento a Udifar II – Distribuição Farmacêutica, S.A. já não está a efetuar encomendas a fornecedores, mantendo apenas uma ligeira atividade de distribuição restrita aos stocks que ainda existem em armazém.\n",
          "contacts":[
             {
                "name":"Compras",
                "email":"compras@udifar.pt",
                "isStared":false
             },
             {
                "name":"Nuno Lopes",
                "email":"nuno.lopes@udifar.pt",
                "isStared":true
             }
          ],
          "state":SupplierState.Others,
          "lastVerification":"0001-01-01T00:00:00",
          "expirationDate":"0001-01-01T00:00:00",
          "creationDate":"2018-01-11T18:34:20.54Z"
       },
       {
          "id":"5f44fe29dfd6c89e1b171b2e",
          "name":"Alliance Healthcare Portugal",
          "type":SupplierType.Wholesaler,
          "country":"Portugal",
          "countryCode":"PT",
          "isEurope":true,
          "classification":3,
          "notes":"http://areaclientes.alliance-healthcare.pt/\nUtilizador: FF15361\nPassword: FF510784429",
          "contacts":[
             {
                "name":"",
                "email":"clientes@alliance-healthcare.pt",
                "isStared":false
             },
             {
                "name":"Grupo Exportacao",
                "email":"grupoexportacao@alliance-healthcare.pt",
                "isStared":true
             },
             {
                "name":"Customer Service",
                "email":"customer.service.lisboa@alliance-healthcare.pt",
                "isStared":false
             },
             {
                "name":"Marcia Pereira",
                "email":"c.pereira@alliance-healthcare.pt",
                "isStared":true
             }
          ],
          "state":SupplierState.Others,
          "lastVerification":"0001-01-01T00:00:00",
          "expirationDate":"0001-01-01T00:00:00",
          "creationDate":"2018-01-11T18:36:04.428Z"
       },
       {
          "id":"5f44fe29dfd6c89e1b171b30",
          "name":"Botelho & Rodrigues",
          "type":SupplierType.Wholesaler,
          "country":"Portugal",
          "countryCode":"PT",
          "isEurope":true,
          "classification":2,
          "notes":"PVA+5%\nLOGIN PORTAL:\n\nuser: 760\npass: nbc\n",
          "contacts":[
             {
                "name":"Helena Cajada",
                "email":"helena.cajada@botelhorodrigues.pt",
                "isStared":false
             },
             {
                "name":"Marta Marques",
                "email":"",
                "isStared":false
             },
             {
                "name":"José Neves",
                "email":"jose.neves@botelhorodrigues.pt",
                "isStared":true
             }
          ],
          "state":SupplierState.Others,
          "lastVerification":"0001-01-01T00:00:00",
          "expirationDate":"0001-01-01T00:00:00",
          "creationDate":"2018-01-11T18:36:42.862Z"
       },
       {
          "id":"5f44fe29dfd6c89e1b171b32",
          "name":"Bayer",
          "type":SupplierType.Manufacturer,
          "country":"Portugal",
          "countryCode":"PT",
          "isEurope":true,
          "classification":3,
          "notes":"Pedidos de preços, validades de produto e disponibilidade de stock deverá ser efetuado para o seguinte e-mail: encomendas@bayer.pt\n Bayer regra geral é para o nacional\n",
          "contacts":[
             {
                "name":"Ricardo Marques",
                "email":"ricardo.marques@bayer.com",
                "isStared":true
             },
             {
                "name":"Encomendas",
                "email":"encomendas@bayer.pt",
                "isStared":true
             }
          ],
          "state":SupplierState.Qualified,
          "lastVerification":"0001-01-01T00:00:00",
          "expirationDate":"0001-01-01T00:00:00",
          "creationDate":"2018-01-12T15:06:17.486Z"
       }
      ],
};
