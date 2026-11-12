
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @IsEmail({}, {
    message: 'El correo electrónico no es válido',
  })
  @IsNotEmpty({
    message: 'El correo es obligatorio',
  })
  email!: string;

  @IsString({
    message: 'La contraseña debe ser un texto',
  })
  @IsNotEmpty({
    message: 'La contraseña es obligatoria',
  })
  @MinLength(8, {
    message: 'La contraseña debe tener al menos 8 caracteres',
  })
  password!: string;
}
