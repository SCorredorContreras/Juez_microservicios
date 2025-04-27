import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ProblemsService } from './problems.service';
import { CreateProblemDto } from './dto/create-problem-dto';

@Controller('problems')
export class ProblemsController {

    constructor(private readonly ProblemsService: ProblemsService) { }

    // Traer todos los problemas
    // Si se pasa el query isPublic=true, solo trae los problemas publicos

    //@Query('tags') tags?: string

    @Get("all")
    public traerCiudades(@Query('isPublic') isPublic?: boolean): any {
        const options: { isPublic?: boolean; tags?: string[] } = {};

        if (isPublic !== undefined) {
            options.isPublic = isPublic;
        }

        //if (tags) {
        //    options.tags = tags.split(',');
        //}

        return this.ProblemsService.findAll(options);
    }

    // Traer un problema por ID
    @Get('findOne/:id')
    public findOne(@Param('id') id: string) {
        return this.ProblemsService.findOne(id);
    }

    // Crear un problema
    @Post("create")
    public crearCiudades(@Body() CreateProblemDto: CreateProblemDto): any {
        return this.ProblemsService.createProblem(CreateProblemDto);
    }

    // Actualizar un problema por ID
    @Patch('update/:id')
    public(@Param('id') id: string, @Body() updateProblemDto: CreateProblemDto) {
        return this.ProblemsService.update(id, updateProblemDto);

    }

    // Eliminar un problema por ID}
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.ProblemsService.remove(id);
    }
}
