using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace AssetTracker.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Bearings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Manufacturer = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Supplier = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bearings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LubricantTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LubricantTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Motors",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    InventoryNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ShaftDiameter = table.Column<double>(type: "double precision", precision: 10, scale: 2, nullable: false),
                    Power = table.Column<double>(type: "double precision", precision: 10, scale: 2, nullable: false),
                    Speed = table.Column<int>(type: "integer", nullable: false),
                    FrontBearingId = table.Column<int>(type: "integer", nullable: false),
                    RearBearingId = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    MountingType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Motors", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Motors_Bearings_FrontBearingId",
                        column: x => x.FrontBearingId,
                        principalTable: "Bearings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Motors_Bearings_RearBearingId",
                        column: x => x.RearBearingId,
                        principalTable: "Bearings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LocationHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MotorId = table.Column<int>(type: "integer", nullable: false),
                    Location = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LocationHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LocationHistories_Motors_MotorId",
                        column: x => x.MotorId,
                        principalTable: "Motors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MaintenanceLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MotorId = table.Column<int>(type: "integer", nullable: false),
                    WorkType = table.Column<string>(type: "text", nullable: false),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Comment = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    PerformedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    BearingPosition = table.Column<string>(type: "text", nullable: true),
                    LubricantTypeId = table.Column<int>(type: "integer", nullable: true),
                    OldBearingId = table.Column<int>(type: "integer", nullable: true),
                    NewBearingId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MaintenanceLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MaintenanceLogs_Bearings_NewBearingId",
                        column: x => x.NewBearingId,
                        principalTable: "Bearings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MaintenanceLogs_Bearings_OldBearingId",
                        column: x => x.OldBearingId,
                        principalTable: "Bearings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MaintenanceLogs_LubricantTypes_LubricantTypeId",
                        column: x => x.LubricantTypeId,
                        principalTable: "LubricantTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MaintenanceLogs_Motors_MotorId",
                        column: x => x.MotorId,
                        principalTable: "Motors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LocationHistories_MotorId",
                table: "LocationHistories",
                column: "MotorId");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenanceLogs_LastLubricant",
                table: "MaintenanceLogs",
                columns: new[] { "MotorId", "WorkType", "BearingPosition", "Date" });

            migrationBuilder.CreateIndex(
                name: "IX_MaintenanceLogs_LubricantTypeId",
                table: "MaintenanceLogs",
                column: "LubricantTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenanceLogs_NewBearingId",
                table: "MaintenanceLogs",
                column: "NewBearingId");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenanceLogs_OldBearingId",
                table: "MaintenanceLogs",
                column: "OldBearingId");

            migrationBuilder.CreateIndex(
                name: "IX_Motors_FrontBearingId",
                table: "Motors",
                column: "FrontBearingId");

            migrationBuilder.CreateIndex(
                name: "IX_Motors_InventoryNumber",
                table: "Motors",
                column: "InventoryNumber",
                unique: true,
                filter: "\"InventoryNumber\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Motors_RearBearingId",
                table: "Motors",
                column: "RearBearingId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LocationHistories");

            migrationBuilder.DropTable(
                name: "MaintenanceLogs");

            migrationBuilder.DropTable(
                name: "LubricantTypes");

            migrationBuilder.DropTable(
                name: "Motors");

            migrationBuilder.DropTable(
                name: "Bearings");
        }
    }
}
