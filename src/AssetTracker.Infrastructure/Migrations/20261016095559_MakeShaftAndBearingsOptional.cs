using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AssetTracker.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MakeShaftAndBearingsOptional : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<double>(
                name: "ShaftDiameter",
                table: "Motors",
                type: "double precision",
                precision: 10,
                scale: 2,
                nullable: true,
                oldClrType: typeof(double),
                oldType: "double precision",
                oldPrecision: 10,
                oldScale: 2);

            migrationBuilder.AlterColumn<int>(
                name: "RearBearingId",
                table: "Motors",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<int>(
                name: "FrontBearingId",
                table: "Motors",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<double>(
                name: "ShaftDiameter",
                table: "Motors",
                type: "double precision",
                precision: 10,
                scale: 2,
                nullable: false,
                defaultValue: 0.0,
                oldClrType: typeof(double),
                oldType: "double precision",
                oldPrecision: 10,
                oldScale: 2,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "RearBearingId",
                table: "Motors",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "FrontBearingId",
                table: "Motors",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);
        }
    }
}
