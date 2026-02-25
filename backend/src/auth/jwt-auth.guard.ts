// *Импортируем декоратор Injectable из NestJS
// *Позволяет классу быть управляемым системой dependency injection NestJS
import { ExecutionContext, Injectable } from '@nestjs/common';

// *Импортируем AuthGuard из @nestjs/passport
// *AuthGuard - базовый класс для создания кастомных guards аутентификации
import { AuthGuard } from '@nestjs/passport';


// *Декоратор @Injectable отмечает класс как провайдер
// *Теперь JwtAuthGuard может быть внедрен в другие классы
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    canActivate(context: ExecutionContext) {
        console.log('🛡️ JwtAuthGuard activated');
        return super.canActivate(context);
    }
}
// *Наследуемся от AuthGuard и указываем стратегию 'jwt'
// *'jwt' соответствует имени стратегии, которую мы определили в JwtStrategy