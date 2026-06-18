import { hash } from "bcryptjs";

import { PrismaClient, UserRole } from '@generated/prisma/client';

interface Company {
  id: string;
  name: string;
}

function getRandomDate(start: Date, end: Date): Date {
  const startTime = start.getTime();
  const endTime = end.getTime();
  const randomTime = startTime + Math.random() * (endTime - startTime);
  return new Date(randomTime);
}

function getUserDates() {
  const start = new Date("2026-01-01T00:00:00");
  const end = new Date("2026-06-17T23:59:59");
  
  // First, get a random createdAt date
  const createdAt = getRandomDate(start, end);
  
  // Then, get a random lastLogin date that's after createdAt
  const lastLogin = getRandomDate(createdAt, end);
  
  return { createdAt, lastLogin };
}

async function hashPassword(password: string): Promise<string> {
  return await hash(password, 8);
}

export async function seedUsers(prisma: PrismaClient) {
  console.log("👥 Criando usuários...");

  const techSolutions = await prisma.company.findUnique({
    where: { cnpj: "12.345.678/0001-90" }
  });
  const metalurgica = await prisma.company.findUnique({
    where: { cnpj: "23.456.789/0001-12" }
  });
  const distribuidoraNordeste = await prisma.company.findUnique({
    where: { cnpj: "34.567.890/0001-45" }
  });

  if (!techSolutions || !metalurgica || !distribuidoraNordeste) {
    throw new Error("Could not find all companies in the database");
  }

  const password = await hashPassword("senha123");

  // ==============================================
  // USUÁRIOS DA TECH SOLUTIONS BRASIL
  // ==============================================
  const techSolutionsUsers: Array<{
    name: string;
    email: string;
    role: UserRole;
    active: boolean;
    lastLogin: Date;
  }> = [
    {
      name: "Lucas Fernando Quinato de Camargo",
      email: "lfqcamargo@gmail.com",
      role: UserRole.ADMIN,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Carlos Eduardo Silva",
      email: "carlos.eduardo.silva@gmail.com",
      role: UserRole.ADMIN,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Mariana Costa Santos",
      email: "mariana.costa.santos@gmail.com",
      role: UserRole.ADMIN,
      active: true,
      lastLogin: new Date(),
    },

    // MANAGERS (5)
    {
      name: "Roberto Almeida Ferreira",
      email: "roberto.almeida.ferreira@gmail.com",
      role: UserRole.MANAGER,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Juliana Rodrigues Oliveira",
      email: "juliana.rodrigues.oliveira@gmail.com",
      role: UserRole.MANAGER,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Fernando Henrique Souza",
      email: "fernando.henrique.souza@gmail.com",
      role: UserRole.MANAGER,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Patrícia Mendes Lima",
      email: "patricia.mendes.lima@gmail.com",
      role: UserRole.MANAGER,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Anderson Luiz Carvalho",
      email: "anderson.luiz.carvalho@gmail.com",
      role: UserRole.MANAGER,
      active: true,
      lastLogin: new Date(),
    },

    // EMPLOYEES (28)
    {
      name: "Bruno Henrique Costa",
      email: "bruno.henrique.costa@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Camila Fernandes Silva",
      email: "camila.fernandes.silva@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Diego Santos Pereira",
      email: "diego.santos.pereira@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Eduarda Cristina Martins",
      email: "eduarda.cristina.martins@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Felipe Augusto Ribeiro",
      email: "felipe.augusto.ribeiro@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Gabriela Alves Nascimento",
      email: "gabriela.alves.nascimento@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Henrique Barbosa Lima",
      email: "henrique.barbosa.lima@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Isabella Moreira Santos",
      email: "isabella.moreira.santos@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "João Pedro Andrade",
      email: "joao.pedro.andrade@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Letícia Cardoso Ferreira",
      email: "leticia.cardoso.ferreira@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Marcos Vinícius Rocha",
      email: "marcos.vinicius.rocha@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Natália Gonçalves Dias",
      email: "natalia.goncalves.dias@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Otávio José Cavalcanti",
      email: "otavio.jose.cavalcanti@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Paula Regina Monteiro",
      email: "paula.regina.monteiro@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Rafael Correia Azevedo",
      email: "rafael.correia.azevedo@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Sabrina Teixeira Ramos",
      email: "sabrina.teixeira.ramos@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Thiago Freitas Barros",
      email: "thiago.freitas.barros@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Vanessa Pinto Araújo",
      email: "vanessa.pinto.araujo@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Wellington Castro Nunes",
      email: "wellington.castro.nunes@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Yasmin Duarte Soares",
      email: "yasmin.duarte.soares@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "André Luiz Melo",
      email: "andre.luiz.melo@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Beatriz Campos Xavier",
      email: "beatriz.campos.xavier@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "César Augusto Pires",
      email: "cesar.augusto.pires@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Daniela Vieira Lopes",
      email: "daniela.vieira.lopes@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Érico Batista Torres",
      email: "erico.batista.torres@gmail.com",
      role: UserRole.EMPLOYEE,
      active: false,
      lastLogin: new Date(),
    },
    {
      name: "Flávia Cristiane Rezende",
      email: "flavia.cristiane.rezende@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Gustavo Miranda Farias",
      email: "gustavo.miranda.farias@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Helena Pacheco Macedo",
      email: "helena.pacheco.macedo@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Igor Alexandre Cunha",
      email: "igor.alexandre.cunha@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
  ];

  const techSolutionsUserData = techSolutionsUsers.map(userData => {
    const dates = getUserDates();
    return {
      ...userData,
      password,
      companyId: techSolutions.id,
      createdAt: dates.createdAt,
      lastLogin: dates.lastLogin,
    };
  });

  await prisma.user.createMany({
    data: techSolutionsUserData,
    skipDuplicates: true,
  });

  console.log(
    `✅ ${techSolutionsUsers.length} usuários criados para ${techSolutions.name}`
  );

  // ==============================================
  // USUÁRIOS DA METALÚRGICA SÃO PAULO
  // ==============================================
  const metalurgicaUsers: Array<{
    name: string;
    email: string;
    role: UserRole;
    active: boolean;
    lastLogin: Date;
  }> = [
    // ADMINS (2)
    {
      name: "Ricardo Mendes Oliveira",
      email: "ricardo.mendes.oliveira@gmail.com",
      role: UserRole.ADMIN,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Fernanda Silva Carvalho",
      email: "fernanda.silva.carvalho@gmail.com",
      role: UserRole.ADMIN,
      active: true,
      lastLogin: new Date(),
    },

    // MANAGERS (6)
    {
      name: "Paulo Roberto Santos",
      email: "paulo.roberto.santos@gmail.com",
      role: UserRole.MANAGER,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Luciana Aparecida Costa",
      email: "luciana.aparecida.costa@gmail.com",
      role: UserRole.MANAGER,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Marcelo Augusto Ferreira",
      email: "marcelo.augusto.ferreira@gmail.com",
      role: UserRole.MANAGER,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Adriana Cristina Lima",
      email: "adriana.cristina.lima@gmail.com",
      role: UserRole.MANAGER,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Sérgio Luiz Rodrigues",
      email: "sergio.luiz.rodrigues@gmail.com",
      role: UserRole.MANAGER,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Cristina Maria Alves",
      email: "cristina.maria.alves@gmail.com",
      role: UserRole.MANAGER,
      active: true,
      lastLogin: new Date(),
    },

    // EMPLOYEES (27)
    {
      name: "Alexandre Pereira Souza",
      email: "alexandre.pereira.souza@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Bianca Rodrigues Martins",
      email: "bianca.rodrigues.martins@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Caio César Barbosa",
      email: "caio.cesar.barbosa@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Débora Santos Nascimento",
      email: "debora.santos.nascimento@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Eduardo Almeida Ribeiro",
      email: "eduardo.almeida.ribeiro@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Fabiana Moura Dias",
      email: "fabiana.moura.dias@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Gabriel Costa Andrade",
      email: "gabriel.costa.andrade@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Heloísa Fernandes Cardoso",
      email: "heloisa.fernandes.cardoso@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Ivan Gonçalves Rocha",
      email: "ivan.goncalves.rocha@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Jéssica Pinto Cavalcanti",
      email: "jessica.pinto.cavalcanti@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Klaus Alberto Monteiro",
      email: "klaus.alberto.monteiro@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Larissa Teixeira Correia",
      email: "larissa.teixeira.correia@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Matheus Henrique Azevedo",
      email: "matheus.henrique.azevedo@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Nara Cristina Ramos",
      email: "nara.cristina.ramos@gmail.com",
      role: UserRole.EMPLOYEE,
      active: false,
      lastLogin: new Date(),
    },
    {
      name: "Oscar Luiz Barros",
      email: "oscar.luiz.barros@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Priscila Duarte Araújo",
      email: "priscila.duarte.araujo@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Quirino Batista Nunes",
      email: "quirino.batista.nunes@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Renata Vieira Soares",
      email: "renata.vieira.soares@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Samuel Castro Melo",
      email: "samuel.castro.melo@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Tatiana Campos Xavier",
      email: "tatiana.campos.xavier@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Ulisses Miranda Pires",
      email: "ulisses.miranda.pires@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Verônica Pacheco Lopes",
      email: "veronica.pacheco.lopes@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Wagner Alexandre Torres",
      email: "wagner.alexandre.torres@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Xênia Cristiane Rezende",
      email: "xenia.cristiane.rezende@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Yuri Freitas Farias",
      email: "yuri.freitas.farias@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Zilda Regina Macedo",
      email: "zilda.regina.macedo@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Antônio Carlos Cunha",
      email: "antonio.carlos.cunha@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Bruna Alves Silva",
      email: "bruna.alves.silva@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
  ];

  const metalurgicaUserData = metalurgicaUsers.map(userData => {
    const dates = getUserDates();
    return {
      ...userData,
      password,
      companyId: metalurgica.id,
      createdAt: dates.createdAt,
      lastLogin: dates.lastLogin,
    };
  });

  await prisma.user.createMany({
    data: metalurgicaUserData,
    skipDuplicates: true,
  });

  console.log(
    `✅ ${metalurgicaUsers.length} usuários criados para ${metalurgica.name}`
  );

  // ==============================================
  // USUÁRIOS DA DISTRIBUIDORA NORDESTE
  // ==============================================
  const distribuidoraUsers: Array<{
    name: string;
    email: string;
    role: UserRole;
    active: boolean;
    lastLogin: Date;
  }> = [
    // ADMINS (2)
    {
      name: "Antônio José Pereira",
      email: "antonio.jose.pereira@gmail.com",
      role: UserRole.ADMIN,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Carmem Lúcia Oliveira",
      email: "carmem.lucia.oliveira@gmail.com",
      role: UserRole.ADMIN,
      active: true,
      lastLogin: new Date(),
    },

    // MANAGERS (5)
    {
      name: "Francisco das Chagas Santos",
      email: "francisco.das.chagas.santos@gmail.com",
      role: UserRole.MANAGER,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Maria do Socorro Costa",
      email: "maria.do.socorro.costa@gmail.com",
      role: UserRole.MANAGER,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "José Ribamar Ferreira",
      email: "jose.ribamar.ferreira@gmail.com",
      role: UserRole.MANAGER,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Ana Paula Rodrigues",
      email: "ana.paula.rodrigues@gmail.com",
      role: UserRole.MANAGER,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Raimundo Nonato Lima",
      email: "raimundo.nonato.lima@gmail.com",
      role: UserRole.MANAGER,
      active: true,
      lastLogin: new Date(),
    },

    // EMPLOYEES (28)
    {
      name: "Aline Cristina Souza",
      email: "aline.cristina.souza@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Benedito Almeida Carvalho",
      email: "benedito.almeida.carvalho@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Cláudia Regina Martins",
      email: "claudia.regina.martins@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Domingos Sávio Ribeiro",
      email: "domingos.savio.ribeiro@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Edna Maria Nascimento",
      email: "edna.maria.nascimento@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Francisco Canindé Alves",
      email: "francisco.caninde.alves@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Geovana Barbosa Dias",
      email: "geovana.barbosa.dias@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Humberto Moreira Andrade",
      email: "humberto.moreira.andrade@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Ione Cardoso Santos",
      email: "ione.cardoso.santos@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Joaquim Ferreira Rocha",
      email: "joaquim.ferreira.rocha@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Kátia Gonçalves Cavalcanti",
      email: "katia.goncalves.cavalcanti@gmail.com",
      role: UserRole.EMPLOYEE,
      active: false,
      lastLogin: new Date(),
    },
    {
      name: "Luciano José Monteiro",
      email: "luciano.jose.monteiro@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Mônica Teixeira Correia",
      email: "monica.teixeira.correia@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Nelson Pinto Azevedo",
      email: "nelson.pinto.azevedo@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Olívia Freitas Ramos",
      email: "olivia.freitas.ramos@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Pedro Henrique Barros",
      email: "pedro.henrique.barros@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Quitéria Duarte Araújo",
      email: "quiteria.duarte.araujo@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Rodrigo Castro Nunes",
      email: "rodrigo.castro.nunes@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Silvia Campos Soares",
      email: "silvia.campos.soares@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Tarcísio Miranda Melo",
      email: "tarcisio.miranda.melo@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Úrsula Vieira Xavier",
      email: "ursula.vieira.xavier@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Valdeci Pacheco Pires",
      email: "valdeci.pacheco.pires@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Wilma Batista Lopes",
      email: "wilma.batista.lopes@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Xavier Alexandre Torres",
      email: "xavier.alexandre.torres@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Yolanda Cristiane Rezende",
      email: "yolanda.cristiane.rezende@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Zenaide Freitas Farias",
      email: "zenaide.freitas.farias@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Alberto Moura Macedo",
      email: "alberto.moura.macedo@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Bárbara Alves Cunha",
      email: "barbara.alves.cunha@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Cícero Santos Silva",
      email: "cicero.santos.silva@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
    {
      name: "Dalva Costa Pereira",
      email: "dalva.costa.pereira@gmail.com",
      role: UserRole.EMPLOYEE,
      active: true,
      lastLogin: new Date(),
    },
  ];

  const distribuidoraUserData = distribuidoraUsers.map(userData => {
    const dates = getUserDates();
    return {
      ...userData,
      password,
      companyId: distribuidoraNordeste.id,
      createdAt: dates.createdAt,
      lastLogin: dates.lastLogin,
    };
  });

  await prisma.user.createMany({
    data: distribuidoraUserData,
    skipDuplicates: true,
  });

  console.log(
    `✅ ${distribuidoraUsers.length} usuários criados para ${distribuidoraNordeste.name}`
  );
}
