import { ValueObject } from '@/core/entities/value-object';

export interface UnitMeasureProps {
  code: string;
  description: string;
}

const predefinedUnits = {
  UN: 'Unidade',
  KG: 'Quilograma',
  G: 'Grama',
  MG: 'Miligrama',
  TON: 'Tonelada',
  L: 'Litro',
  ML: 'Mililitro',
  M: 'Metro',
  CM: 'Centímetro',
  MM: 'Milímetro',
  M2: 'Metro Quadrado',
  M3: 'Metro Cúbico',
  CX: 'Caixa',
  PC: 'Peça',
  PCT: 'Pacote',
  FD: 'Fardo',
  BDJ: 'Bandagem',
  RL: 'Rolo',
  SC: 'Saco',
  LT: 'Lata',
  GAL: 'Galão',
  JAR: 'Jarro',
  TBL: 'Tubo',
  KIT: 'Kit',
} as const;

type UnitCode = keyof typeof predefinedUnits;

export class UnitMeasure extends ValueObject<UnitMeasureProps> {
  static readonly predefinedUnits = predefinedUnits;
  static readonly availableCodes = Object.keys(predefinedUnits) as [
    UnitCode,
    ...UnitCode[],
  ];

  get code() {
    return this.props.code;
  }

  get description() {
    return this.props.description;
  }

  toString() {
    return this.code;
  }

  get displayName() {
    return `${this.code} - ${this.description}`;
  }

  static fromCode(code: string): UnitMeasure {
    const description = predefinedUnits[code as UnitCode];

    if (!description) {
      throw new Error(`Invalid unit measure code: ${code}`);
    }

    return new UnitMeasure({ code, description });
  }
}
